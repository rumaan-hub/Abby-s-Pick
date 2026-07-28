export type CartItem = {
    id: string; // WooCommerce Product ID
    title: string;
    slug: string;
    price: number;
    image?: string;
    quantity: number;
};
