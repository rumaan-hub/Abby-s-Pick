import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Flame,
  Gift,
  Users,
  Tag,
  Truck,
  ShoppingBag,
  Sofa,
  Dumbbell,
  Shirt,
  UtensilsCrossed,
  ToyBrick,
  PawPrint,
  Plane,
  Trees,
  ArrowRight,
  Percent,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { getExclusiveDeals, type Deal } from "@/lib/deals.functions";
import { CartBadge } from "@/components/cart/CartBadge";
import { useCart } from "@/components/cart/CartContext";
import { Check, ShoppingCart } from "lucide-react";

const dealsQueryOptions = queryOptions({
  queryKey: ["exclusive-deals"],
  queryFn: () => getExclusiveDeals(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  component: DealsCorner,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(dealsQueryOptions);
  },
  errorComponent: ({ error, reset }) => {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold">
          Couldn't load deals
        </h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
        >
          Try again
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Not found</div>
  ),
});


// ---------- Content (edit these to point at your WooCommerce products) ----------

type Category = {
  name: string;
  icon: typeof Sofa;
  href: string;
  count: string;
};

const categories: Category[] = [
  { name: "Home Decor", icon: Sofa, href: "#", count: "120+ deals" },
  { name: "Sports", icon: Dumbbell, href: "#", count: "80+ deals" },
  { name: "Clothing", icon: Shirt, href: "#", count: "210+ deals" },
  { name: "Kitchen", icon: UtensilsCrossed, href: "#", count: "95+ deals" },
  { name: "Kids Toys", icon: ToyBrick, href: "#", count: "60+ deals" },
  { name: "Pets", icon: PawPrint, href: "#", count: "45+ deals" },
  { name: "Travel Gadgets", icon: Plane, href: "#", count: "70+ deals" },
  { name: "Lawn & Garden", icon: Trees, href: "#", count: "50+ deals" },
];

// ---------- Page ----------

function DealsCorner() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <MarqueeStrip />
      <BentoDeals />
      <CategoriesGrid />
      <ReferralBanner />
      <Footer />
    </main>
  );
}

// ---------- Nav ----------

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Abby's Picks logo"
            className="h-9 w-9 object-contain"
          />
          <span className="font-display text-lg font-extrabold tracking-tight">
            Abby's&nbsp;<span className="text-gradient-blaze">Picks</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#deals" className="transition-colors hover:text-foreground">This Week</a>
          <a href="#bundles" className="transition-colors hover:text-foreground">Bundles</a>
          <a href="#categories" className="transition-colors hover:text-foreground">Categories</a>
          <a href="#referral" className="transition-colors hover:text-foreground">Refer & Earn</a>
        </nav>
        <div className="flex items-center gap-4">
          <a
            href="#deals"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            Shop deals <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <CartBadge />
        </div>
      </div>
    </header>
  );
}

// ---------- Hero ----------

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-14 md:pb-24 md:pt-20">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.77 0.17 60 / 0.55), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-magenta" />
          Week 27 · Fresh Drops Every Monday
        </div>
        <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
          <span className="text-gradient-blaze">Abby's Picks</span>
          <br className="hidden md:block" />
          your store deserves.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Buy 2 Get 1 Free. 3-in-1 bundles. Weekly flash discounts. Referral
          rewards. One embeddable page that turns browsers into buyers —
          across every category you sell.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#deals"
            className="inline-flex items-center gap-2 rounded-full bg-blaze-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-deal transition-transform hover:-translate-y-0.5"
          >
            See this week's deals <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#referral"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <Gift className="h-4 w-4" /> Refer & earn
          </a>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat kpi="Exclusive Deals" label="Choose the right one" />
          <Stat kpi="35%" label="Avg. discount this week" />
          <Stat kpi="24h" label="Flash deals reset weekly" />
          <Stat kpi="Upto 15%" label="On successful referral" />
        </div>
      </div>
    </section>
  );
}

function Stat({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        {kpi}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

// ---------- Marquee strip ----------

function MarqueeStrip() {
  const items = [
    "Free Shipping over $50",
    "Buy 2 Get 1 Free",
    "Weekly Flash Sale",
    "Refer & Get $5",
    "3-in-1 Bundles",
    "Members Save 15%",
    "New Drops · Mondays",
  ];
  return (
    <div className="overflow-hidden border-y border-border bg-ink-gradient py-3 text-cream">
      {/* Outer wrapper clips overflow; the inner track animates.
          w-max lets the track grow to its full content width so the two
          copies are exactly twice one copy's width — required for the
          -50% shift to loop seamlessly. */}
      <div className="marquee-track flex w-max items-center whitespace-nowrap text-sm font-semibold tracking-wide">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-5">
            <Percent className="h-3.5 w-3.5 text-amber" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- Bento deals ----------

function BentoDeals() {
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);

  return (
    <section id="deals" className="mx-auto max-w-7xl px-5 py-20">
      <SectionHead
        eyebrow="Exclusive Deals · Live"
        title="Straight from Abbystopshop."
        sub="Every tile below is pulled live from your WooCommerce 'Exclusive Deals' category. Add or remove products in WooCommerce and this page updates automatically."
      />

      {deals.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="font-display text-2xl font-extrabold">
            No deals live right now
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Assign products to the <strong>Exclusive Deals</strong> category in
            your WooCommerce admin and they'll appear here instantly.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {deals.map((d) => (
            <ProductDealCard key={d.id} deal={d} />
          ))}
        </div>
      )}
    </section>
  );
}

function formatPrice(v: string): string {
  if (!v) return "";
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return `$${n.toFixed(2)}`;
}

// Checkout URL is now built server-side in deals.functions.ts using the
// trusted WOOCOMMERCE_STORE_URL env var (prevents open-redirect attacks).

function ProductDealCard({ deal }: { deal: Deal }) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const discount =
    deal.onSale && deal.regularPrice && deal.salePrice
      ? Math.round(
        ((Number(deal.regularPrice) - Number(deal.salePrice)) /
          Number(deal.regularPrice)) *
        100,
      )
      : 0;

  const handleAddToCart = () => {
    const numericPrice = Number(deal.salePrice || deal.price) || 0;
    addItem({
      id: String(deal.id),
      title: deal.name,
      slug: deal.slug,
      price: numericPrice,
      image: deal.image ?? undefined,
      quantity: 1,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <Link to="/products/$slug" params={{ slug: deal.slug }} className="relative aspect-[4/3] w-full overflow-hidden bg-muted/50 block">
        {deal.image && (
          <img
            src={deal.image}
            alt={deal.name}
            width={768}
            height={576}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur-md">
            <Flame className="h-3 w-3" />
            {deal.categories[0] ?? "Exclusive"}
          </span>
          {discount > 0 && (
            <span className="inline-flex rounded-md bg-blaze px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              −{discount}%
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link to="/products/$slug" params={{ slug: deal.slug }} className="hover:underline">
          <h3 className="line-clamp-2 font-display text-base font-bold leading-tight text-foreground">
            {deal.name}
          </h3>
        </Link>

        <div className="mt-auto pt-5">
          <div className="flex items-end gap-2">
            <span className="font-display text-xl font-extrabold text-foreground">
              {formatPrice(deal.salePrice || deal.price)}
            </span>
            {deal.onSale && deal.regularPrice && (
              <span className="mb-0.5 text-xs font-medium text-muted-foreground line-through">
                {formatPrice(deal.regularPrice)}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/products/$slug"
              params={{ slug: deal.slug }}
              className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card px-2.5 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary hover:text-foreground text-center"
            >
              View Details <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-2.5 text-xs font-semibold transition-colors text-center ${isAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-foreground text-background hover:bg-foreground/90"
                }`}
            >
              {isAdded ? (
                <>
                  Added <Check className="h-3.5 w-3.5 shrink-0" />
                </>
              ) : (
                <>
                  Add to Cart <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}





// ---------- Categories ----------

function CategoriesGrid() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-20">
      <SectionHead
        eyebrow="Shop by Corner"
        title="Every category, every discount."
        sub="Same offer engine across your entire store — plug and play."
      />
      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.map((c) => (
          <a
            key={c.name}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-deal"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-foreground transition-colors group-hover:bg-blaze-gradient group-hover:text-white">
                <c.icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </div>
            <div className="mt-5 font-display text-lg font-bold tracking-tight">
              {c.name}
            </div>
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {c.count}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ---------- Referral banner ----------

function ReferralBanner() {
  return (
    <section id="referral" className="mx-auto max-w-7xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-ink-gradient p-8 text-cream shadow-deal-lg md:p-14">
        <div className="pointer-events-none absolute inset-0 noise opacity-30" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "oklch(0.63 0.24 350 / 0.55)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "oklch(0.71 0.19 40 / 0.5)" }}
        />

        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
              <Gift className="h-3.5 w-3.5 text-amber" /> Refer & Earn
            </span>
            <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Share the corner. <br />
              <span className="text-gradient-blaze">Both of you save $5.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm text-cream/70 md:text-base">
              Send your unique link. When a friend shops their first deal, you
              both bag $5 off — instantly, no minimum.
            </p>
          </div>

          <div className="grid gap-3">
            <ReferStep n="1" title="Grab your link" desc="One tap. Yours forever." icon={<Tag className="h-4 w-4" />} />
            <ReferStep n="2" title="Share it anywhere" desc="WhatsApp, Insta, email — you pick." icon={<Users className="h-4 w-4" />} />
            <ReferStep n="3" title="Both earn $5" desc="Auto-applied at checkout." icon={<Gift className="h-4 w-4" />} />
            <button
              disabled
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white/20 px-6 py-3.5 text-sm font-semibold text-white/60 cursor-not-allowed"
            >
              Coming Soon <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReferStep({ n, title, desc, icon }: { n: string; title: string; desc: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blaze-gradient font-display text-sm font-extrabold text-white">
        {n}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 font-display font-bold">
          {icon} {title}
        </div>
        <div className="text-xs text-cream/70">{desc}</div>
      </div>
    </div>
  );
}

// ---------- Section head ----------

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <ShoppingBag className="h-3.5 w-3.5 text-blaze" />
        {eyebrow}
      </div>
      <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
        {title}
      </h2>
      <p className="mt-3 text-muted-foreground">{sub}</p>
    </div>
  );
}

// ---------- Footer ----------

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Abby's Picks logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-display text-sm font-extrabold">Abby's Picks</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Truck className="h-3.5 w-3.5" />
          Free shipping over $50 · Easy 7-day returns
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Abby's Picks. Embeddable in any WooCommerce store.
        </div>
      </div>
    </footer>
  );
}
