<?php
/**
 * Plugin Name: Deals Connect
 * Description: Secure endpoint for Headless TanStack Cart integration to native WooCommerce Checkout.
 * Version: 1.0.1-TRACE
 * Author: Deals
 * Text Domain: deals-connect
 */

if (!defined('ABSPATH')) {
    exit;
}

error_log("Plugin file loaded");

final class Deals_Connect
{
    private static $api_namespace = 'deals/v1';
    private static $api_route = '/checkout-session';

    public function __construct()
    {
        error_log("Constructor executed");
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('template_redirect', [$this, 'handle_checkout_redirect']);
        add_action('admin_notices', function () {
            echo '<div class="notice notice-success"><p>Deals Connect constructor executed.</p></div>';
        });
    }

    public function register_routes()
    {
        register_rest_route(self::$api_namespace, self::$api_route, [
            'methods'             => 'POST',
            'callback'            => [$this, 'create_checkout_session'],
            'permission_callback' => [$this, 'check_api_permission'],
        ]);
    }

    public function check_api_permission(WP_REST_Request $request)
    {
        $timestamp = $request->get_header('x_deals_timestamp');
        $signature = $request->get_header('x_deals_signature');

        $secret = defined('DEALS_API_SECRET') ? DEALS_API_SECRET : get_option('deals_api_secret');
        if (empty($secret)) {
            return new WP_Error('rest_forbidden', 'Server is missing API secret configuration.', ['status' => 500]);
        }

        if (empty($timestamp) || empty($signature)) {
            return new WP_Error('rest_forbidden', 'Missing signature or timestamp.', ['status' => 401]);
        }

        $request_time = absint($timestamp);
        $current_time = time();
        $window       = 5 * MINUTE_IN_SECONDS;

        if ($request_time < ($current_time - $window) || $request_time > ($current_time + 60)) {
            return new WP_Error('rest_forbidden', 'Request timestamp is invalid or expired.', ['status' => 401]);
        }

        $transient_key = 'deals_nonce_' . md5($signature);
        if (get_transient($transient_key)) {
            return new WP_Error('rest_forbidden', 'Replay attack detected. Request already processed.', ['status' => 401]);
        }

        $payload  = $request->get_method() . '.' . $request->get_route() . '.' . $timestamp . '.' . $request->get_body();
        $expected = hash_hmac('sha256', $payload, (string) $secret);

        if (!hash_equals($expected, (string) $signature)) {
            return new WP_Error('rest_forbidden', 'Invalid signature.', ['status' => 401]);
        }

        set_transient($transient_key, true, $window);
        return true;
    }

    public function create_checkout_session(WP_REST_Request $request)
    {
        $params = $request->get_json_params();
        if (empty($params['cart_items']) || !is_array($params['cart_items'])) {
            return new WP_Error('invalid_payload', 'Cart items are missing or invalid.', ['status' => 400]);
        }

        $idempotency_key = $request->get_header('x_deals_idempotency_key');
        if (!empty($idempotency_key)) {
            $idemp_cache_key = 'deals_idemp_' . md5($idempotency_key);
            $lock_key        = 'deals_lock_' . md5($idempotency_key);

            if (get_transient($lock_key)) {
                return new WP_Error('conflict', 'Request is processing, please retry.', ['status' => 409]);
            }

            $cached_response = get_transient($idemp_cache_key);
            if ($cached_response) {
                return rest_ensure_response(json_decode($cached_response, true));
            }

            set_transient($lock_key, true, MINUTE_IN_SECONDS);
        }

        try {
            $items_to_store = [];
            foreach ($params['cart_items'] as $item) {
                $product_id = isset($item['product_id']) ? absint($item['product_id']) : 0;
                $quantity   = isset($item['quantity']) ? absint($item['quantity']) : 1;

                if ($product_id > 0 && $quantity > 0) {
                    $product = wc_get_product($product_id);
                    if (!$product || !$product->is_in_stock()) {
                        return new WP_Error('invalid_product', "Product ID {$product_id} is invalid or out of stock.", ['status' => 400]);
                    }
                    $items_to_store[] = [
                        'product_id' => $product_id,
                        'quantity'   => $quantity,
                    ];
                }
            }

            if (empty($items_to_store)) {
                return new WP_Error('invalid_payload', 'No valid cart items provided.', ['status' => 400]);
            }

            $session_token = wp_generate_password(32, false);
            set_transient('deals_cart_session_' . $session_token, wp_json_encode($items_to_store), 15 * MINUTE_IN_SECONDS);

            $checkout_url = add_query_arg(['deals_session' => $session_token], wc_get_checkout_url());
            $response_data = [
                'success'      => true,
                'checkout_url' => $checkout_url,
            ];

            if (!empty($idempotency_key)) {
                if (!set_transient($idemp_cache_key, wp_json_encode($response_data), 15 * MINUTE_IN_SECONDS)) {
                    return new WP_Error('cache_write_failed', 'Internal server error saving session state.', ['status' => 500]);
                }
            }

            return rest_ensure_response($response_data);

        } catch (Throwable $e) {
            return new WP_Error('internal_server_error', 'Server error processing checkout.', ['status' => 500]);
        } finally {
            if (!empty($idempotency_key)) {
                delete_transient($lock_key);
            }
        }
    }

    public function handle_checkout_redirect()
    {
        if (!isset($_GET['deals_session']) || is_admin()) {
            return;
        }

        $session_token  = sanitize_text_field($_GET['deals_session']);
        $transient_name = 'deals_cart_session_' . $session_token;
        $cart_data_json = get_transient($transient_name);

        if ($cart_data_json) {
            $items = json_decode($cart_data_json, true);
            if (is_array($items) && !empty($items)) {
                if (function_exists('wc_load_cart')) {
                    wc_load_cart();
                }

                if (null === WC()->session) {
                    $session_class = apply_filters('woocommerce_session_handler', 'WC_Session_Handler');
                    WC()->session  = new $session_class();
                    WC()->session->init();
                }

                WC()->session->set_customer_session_cookie(true);

                if (null === WC()->cart) {
                    WC()->cart = new WC_Cart();
                }

                WC()->cart->empty_cart();

                $added_count = 0;
                foreach ($items as $item) {
                    $product_id = isset($item['product_id']) ? absint($item['product_id']) : 0;
                    $quantity   = isset($item['quantity']) ? absint($item['quantity']) : 1;

                    if ($product_id > 0 && $quantity > 0) {
                        $product = wc_get_product($product_id);
                        if ($product && $product->is_in_stock()) {
                            $parent_id    = $product_id;
                            $variation_id = 0;
                            $variations   = [];

                            if ($product->is_type('variation')) {
                                $parent_id    = $product->get_parent_id();
                                $variation_id = $product_id;
                                $variations   = $product->get_variation_attributes();
                            } elseif ($product->is_type('variable')) {
                                $children = $product->get_children();
                                if (!empty($children)) {
                                    $variation_id = $children[0];
                                    $child_prod   = wc_get_product($variation_id);
                                    if ($child_prod) {
                                        $variations = $child_prod->get_variation_attributes();
                                    }
                                }
                            }

                            $cart_item_key = WC()->cart->add_to_cart($parent_id, $quantity, $variation_id, $variations);
                            if ($cart_item_key) {
                                $added_count++;
                            }
                        }
                    }
                }

                if ($added_count === 0 && !empty($items)) {
                    wc_add_notice('Could not add items to your checkout session. Please try again.', 'error');
                    delete_transient($transient_name);
                    wp_safe_redirect(wc_get_cart_url());
                    exit;
                }

                WC()->cart->calculate_totals();
                WC()->session->save_data();
                delete_transient($transient_name);

                wp_safe_redirect(wc_get_checkout_url());
                exit;
            }
        }

        wc_add_notice('Your checkout session expired or was invalid. Please try again.', 'error');
        wp_safe_redirect(wc_get_cart_url());
        exit;
    }
}

new Deals_Connect();
