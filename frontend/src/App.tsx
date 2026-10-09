import { useEffect, useMemo, useState } from "react";
import type {
  CSSProperties,
  FormEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Trash2,
  User,
  UserRound,
  X,
  MessageSquare,
} from "lucide-react";
import CustomerAuthPage from "./CustomerAuthPage";
import CustomerAccountPage from "./CustomerAccountPage";
import GiftingPage from "./GiftingPage";
import api from "./services/api";

type Category = "Nuts" | "Seeds" | "Spices" | "Gifting";
type Weight = "100g" | "250g" | "500g";
type BuilderKind = "nut-mix" | "spice-blend" | "seed-mix";
type OriginKey =
  | "Goa"
  | "Kashmir"
  | "Kerala"
  | "Bihar"
  | "Rajasthan"
  | "Gujarat"
  | "Madhya Pradesh"
  | "Uttarakhand";

type Product = {
  id: string;
  name: string;
  hindi_name?: string;
  category: Category;
  origin: string;
  description: string;
  price: string;
  rating: string;
  imagePosition: string;
  tag?: string;
  packagingKey: string;
  variants?: { weight_label: string; price: number }[];
};

type CartLine = {
  id: string;
  name: string;
  category: string;
  origin: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
  custom?: boolean;
};

type BuilderOption = {
  id: string;
  productId: string;
  label: string;
  note: string;
};

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

let products: Product[] = [];
let catalogue = products;
const setProducts = (data: Product[]) => {
  products = data;
  catalogue = data;
};
const weights: { label: Weight; multiplier: number }[] = [
  { label: "100g", multiplier: 0.45 },
  { label: "250g", multiplier: 1 },
  { label: "500g", multiplier: 1.82 },
];

const productImage = (product: Product, weight: Weight = "250g") =>
  asset(
    `${product.category === "Spices" ? "products-spices" : product.category === "Seeds" ? "products-seeds" : "products-official"}/${product.packagingKey}-${weight}.webp`,
  );
const numericPrice = (price: string) => Number(price.replace(/[^0-9]/g, ""));
const money = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;
const findProduct = (id: string) =>
  catalogue.find((product) => product.id === id || product.packagingKey === id);

const origins: Record<
  OriginKey,
  {
    region: string;
    title: string;
    copy: string;
    coordinates: string;
    products: string[];
    image: string;
    ingredients: string[];
  }
> = {
  Goa: {
    region: "West coast · 15°29′N",
    title: "Salt air, sun-warmed harvests.",
    copy: "A coastal palette of cashews, coconut and fragrant botanicals, sourced from small growers close to the Arabian Sea.",
    coordinates: "15.2993° N, 74.1240° E",
    products: ["Giant Jumbo Cashews", "Premium Dry Coconut"],
    image: "compositions/category-nuts.webp",
    ingredients: ["Cashew", "Coconut", "Warm botanicals"],
  },
  Kashmir: {
    region: "Northern valley · 34°05′N",
    title: "High valleys, quiet richness.",
    copy: "Cooler days and old orchards create walnuts, almonds and saffron with unmistakable depth of flavour.",
    coordinates: "34.0837° N, 74.7973° E",
    products: [
      "Cracked Snow Walnuts",
      "Premium Mamra Almonds",
      "Kashmir Saffron",
    ],
    image: "compositions/category-nuts.webp",
    ingredients: ["Walnuts", "Almonds", "Saffron"],
  },
  Kerala: {
    region: "Spice coast · 10°51′N",
    title: "Where spice becomes ritual.",
    copy: "A humid, fertile coast where coconut, pepper, cardamom and seed crops are grown slowly and handled with care.",
    coordinates: "10.8505° N, 76.2711° E",
    products: [
      "Premium Dry Coconut",
      "Idukki Green Cardamom",
      "Tellicherry Black Pepper",
    ],
    image: "compositions/category-spices.webp",
    ingredients: ["Coconut", "Black pepper", "Cardamom"],
  },
  Bihar: {
    region: "Eastern plains · 25°36′N",
    title: "Generous soil, heirloom goodness.",
    copy: "Rich alluvial soil and patient cultivation shape a quietly generous pantry of fox nuts and creamy seeds.",
    coordinates: "25.0961° N, 85.3131° E",
    products: ["Premium Fox Nuts (Makhana)", "Bihar Melon Seeds"],
    image: "compositions/category-seeds.webp",
    ingredients: ["Makhana", "Melon seeds", "Mustard"],
  },
  Rajasthan: {
    region: "Desert bloom · 27°01′N",
    title: "Sunlit fields, aromatic harvests.",
    copy: "A dry, luminous landscape where seeds and spice develop concentrated character.",
    coordinates: "27.0238° N, 74.2179° E",
    products: ["Rajasthan Pumpkin Seeds", "Rajasthan Coriander"],
    image: "compositions/category-spices.webp",
    ingredients: ["Cumin", "Coriander", "Pumpkin seeds"],
  },
  Gujarat: {
    region: "Western plains · 22°15′N",
    title: "A polished, nutty signature.",
    copy: "Warm soil and careful selection give Gujarat its bright, toasty pantry language.",
    coordinates: "22.2587° N, 71.1924° E",
    products: ["Gujarat Flax Seeds", "Golden Cumin"],
    image: "compositions/category-seeds.webp",
    ingredients: ["Sesame", "Flax", "Cumin"],
  },
  "Madhya Pradesh": {
    region: "Central India · 23°28′N",
    title: "The heartland of harvest.",
    copy: "Open fields and steady hands shape seeds with clean flavour and confident texture.",
    coordinates: "23.4733° N, 77.9470° E",
    products: ["Madhya Pradesh Sunflower Seeds"],
    image: "compositions/category-seeds.webp",
    ingredients: ["Sunflower seeds", "Coriander", "Wheat"],
  },
  Uttarakhand: {
    region: "Himalayan foothills · 30°06′N",
    title: "A clear, high-altitude rhythm.",
    copy: "Mountain air and slower growing seasons create ingredients with clarity and lift.",
    coordinates: "30.0668° N, 79.0193° E",
    products: ["Himalayan Chia Seeds"],
    image: "compositions/category-seeds.webp",
    ingredients: ["Chia", "Mountain herbs", "Wild botanicals"],
  },
};

const reasons = [
  {
    icon: Sprout,
    eyebrow: "01",
    title: "Hand selected origins",
    copy: "Every harvest is chosen for provenance, flavour, texture and the story it carries.",
  },
  {
    icon: Leaf,
    eyebrow: "02",
    title: "Single origin ingredients",
    copy: "No anonymous blends. We keep the character of each region visible and expressive.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "03",
    title: "100% natural",
    copy: "No chemicals, no artificial preservatives — just careful handling and a clean finish.",
  },
  {
    icon: BadgeCheck,
    eyebrow: "04",
    title: "Premium quality control",
    copy: "A quiet, rigorous standard from first selection to final seal, batch after batch.",
  },
  {
    icon: PackageCheck,
    eyebrow: "05",
    title: "Farm to table",
    copy: "Direct relationships, small batches and luxury packaging that protects what matters.",
  },
  {
    icon: Sparkles,
    eyebrow: "06",
    title: "Authentic taste",
    copy: "Nutrient dense, carefully curated and made for a more generous everyday ritual.",
  },
];

const fallbackTestimonials = [
  {
    review_text:
      "The packaging is gorgeous, but the flavour is what keeps me coming back. It feels like a considered ritual, not a snack.",
    customer_name: "Ananya Mehta",
    role: "Bengaluru · verified customer",
  },
  {
    review_text:
      "NAAVORI makes the pantry feel ceremonial. The Kashmir walnuts are impossibly fresh and the detail is exceptional.",
    customer_name: "Rohan Kapoor",
    role: "Mumbai · verified customer",
  },
  {
    review_text:
      "A beautiful expression of Indian provenance. The spiced medley is my new desk-side essential.",
    customer_name: "Mira Shah",
    role: "New Delhi · verified customer",
  },
];

function ReviewSubmissionPage({
  navigate,
  setToast,
}: {
  navigate: (path: string) => void;
  setToast: (message: string) => void;
}) {
  const submitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await api.post("/reviews", Object.fromEntries(formData));
      setToast("Thank you! Your review has been submitted for moderation.");
      navigate("/");
    } catch (error) {
      setToast("Failed to submit review. Please try again.");
    }
  };

  return (
    <main
      className="section-pad"
      style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "120px" }}
    >
      <h1
        style={{
          fontFamily: "Cormorant Garamond",
          fontSize: "40px",
          color: "#38243F",
          marginBottom: "8px",
        }}
      >
        Leave a Review
      </h1>
      <p style={{ fontFamily: "DM Sans", color: "#666", marginBottom: "32px" }}>
        Share your NAAVORI experience with others.
      </p>
      <form
        onSubmit={submitReview}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontFamily: "DM Sans",
            fontSize: "14px",
          }}
        >
          Your Name
          <input
            required
            name="customer_name"
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            placeholder="Jane Doe"
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontFamily: "DM Sans",
            fontSize: "14px",
          }}
        >
          Rating (1-5)
          <select
            required
            name="rating"
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            defaultValue="5"
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Terrible</option>
          </select>
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontFamily: "DM Sans",
            fontSize: "14px",
          }}
        >
          Your Review
          <textarea
            required
            name="review_text"
            rows={5}
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            placeholder="Tell us what you think..."
          />
        </label>
        <button type="submit" className="button button--dark button--full">
          Submit Review{" "}
          <MessageSquare size={16} style={{ marginLeft: "8px" }} />
        </button>
      </form>
    </main>
  );
}

const builderData: Record<
  BuilderKind,
  {
    label: string;
    title: string;
    copy: string;
    kicker: string;
    image: string;
    options: BuilderOption[];
  }
> = {
  "nut-mix": {
    label: "Nut mix",
    title: "Build your own nut mix.",
    copy: "Compose a personal pantry ritual from hand-selected nuts, orchard fruit and toasted coastal notes.",
    kicker: "01 · The custom nut edit",
    image: "products-official/mamra-almonds-250g.webp",
    options: [
      {
        id: "almonds",
        productId: "mamra-almonds",
        label: "Mamra Almonds",
        note: "Kashmir · crisp",
      },
      {
        id: "cashews",
        productId: "jumbo-cashews",
        label: "Jumbo Cashews",
        note: "Goa · buttery",
      },
      {
        id: "pistachios",
        productId: "pistachios",
        label: "Pistachios",
        note: "Bihar · sweet",
      },
      {
        id: "walnuts",
        productId: "snow-walnuts",
        label: "Snow Walnuts",
        note: "Kashmir · rich",
      },
      {
        id: "raisins",
        productId: "raisins",
        label: "Premium Raisins",
        note: "Maharashtra · honeyed",
      },
      {
        id: "fox-nuts",
        productId: "fox-nuts-makhana",
        label: "Fox Nuts",
        note: "Bihar · airy",
      },
      {
        id: "dry-coconut",
        productId: "dry-coconut",
        label: "Dry Coconut",
        note: "Kerala · fragrant",
      },
    ],
  },
  "spice-blend": {
    label: "Spice blend",
    title: "Build your own spice blend.",
    copy: "Layer whole spices into a custom aromatic signature for tables, gifting and slow cooking.",
    kicker: "02 · The custom spice edit",
    image: "products-spices/tellicherry-black-pepper-250g.webp",
    options: [
      {
        id: "pepper",
        productId: "tellicherry-black-pepper",
        label: "Black Pepper",
        note: "Malabar · bold",
      },
      {
        id: "cardamom",
        productId: "idukki-green-cardamom",
        label: "Green Cardamom",
        note: "Kerala · floral",
      },
      {
        id: "cloves",
        productId: "zanzibar-cloves",
        label: "Whole Cloves",
        note: "Zanzibar · warm",
      },
      {
        id: "cinnamon",
        productId: "ceylon-cinnamon",
        label: "Ceylon Cinnamon",
        note: "Sri Lanka · light",
      },
      {
        id: "nutmeg",
        productId: "malabar-nutmeg",
        label: "Malabar Nutmeg",
        note: "Kerala · resinous",
      },
      {
        id: "star-anise",
        productId: "royal-garam-masala",
        label: "Star Anise Blend",
        note: "North India · layered",
      },
      {
        id: "cumin",
        productId: "golden-cumin",
        label: "Golden Cumin",
        note: "Gujarat · toasted",
      },
    ],
  },
  "seed-mix": {
    label: "Seed mix",
    title: "Build your own seed mix.",
    copy: "Bring together mineral-rich seeds from India’s fields for a bright, plant-powered everyday blend.",
    kicker: "03 · The custom seed edit",
    image: "products-seeds/rajasthan-pumpkin-seeds-250g.webp",
    options: [
      {
        id: "pumpkin",
        productId: "rajasthan-pumpkin-seeds",
        label: "Pumpkin Seeds",
        note: "Rajasthan · buttery",
      },
      {
        id: "sunflower",
        productId: "madhya-pradesh-sunflower-seeds",
        label: "Sunflower Seeds",
        note: "Madhya Pradesh · crisp",
      },
      {
        id: "melon",
        productId: "bihar-melon-seeds",
        label: "Melon Seeds",
        note: "Bihar · creamy",
      },
      {
        id: "flax",
        productId: "gujarat-flax-seeds",
        label: "Flax Seeds",
        note: "Gujarat · toasty",
      },
      {
        id: "chia",
        productId: "himalayan-chia-seeds",
        label: "Chia Seeds",
        note: "Uttarakhand · mineral",
      },
      {
        id: "sesame",
        productId: "tamil-nadu-sesame-seeds",
        label: "Sesame Seeds",
        note: "Tamil Nadu · nutty",
      },
      {
        id: "watermelon",
        productId: "maharashtra-watermelon-seeds",
        label: "Watermelon Seeds",
        note: "Maharashtra · delicate",
      },
    ],
  },
};

function LogoImage({ light = false }: { light?: boolean }) {
  return (
    <img
      className={`logo-image ${light ? "logo-image--light" : ""}`}
      src={asset("naavori-logo-transparent.png")}
      alt="NAAVORI NUTS"
      decoding="async"
    />
  );
}

function LoadingScreen({ done }: { done: boolean }) {
  return (
    <div className={`loader ${done ? "loader--done" : ""}`} aria-hidden={done}>
      <div className="loader__halo" />
      <LogoImage light />
      <span className="loader__line" />
      <p>Origins of the exotic</p>
    </div>
  );
}

function ProductImage({
  product,
  eager = false,
  weight = "250g" as Weight,
}: {
  product: Product;
  eager?: boolean;
  weight?: Weight;
}) {
  return (
    <div
      className="product-image product-image--real"
      style={{ backgroundPosition: product.imagePosition }}
    >
      <img
        src={productImage(product, weight)}
        alt={`${product.name} NAAVORI packaging`}
        loading={eager ? "eager" : "lazy"}
      />
      <span className="product-image__wash" />
    </div>
  );
}

function ProductCard({
  product,
  liked,
  onLike,
  onCart,
  onBuy,
  onQuickView,
}: {
  product: Product;
  liked: boolean;
  onLike: () => void;
  onCart: () => void;
  onBuy: () => void;
  onQuickView: () => void;
}) {
  return (
    <article className="product-card" data-reveal>
      <button
        className={`wish-button ${liked ? "wish-button--active" : ""}`}
        onClick={onLike}
        aria-label={`${liked ? "Remove" : "Add"} ${product.name} ${liked ? "from" : "to"} wishlist`}
      >
        <Heart size={16} fill={liked ? "currentColor" : "none"} />
      </button>
      <button
        className="product-card__visual"
        onClick={onQuickView}
        aria-label={`View details for ${product.name}`}
      >
        {product.tag && (
          <span className="product-card__tag">{product.tag}</span>
        )}
        <ProductImage product={product} />
        <span className="quick-view">
          View details <ArrowUpRight size={14} />
        </span>
      </button>
      <div className="product-card__meta">
        <div className="product-card__title-row">
          <div>
            <p className="eyebrow">
              {product.category} · {product.origin}
            </p>
            <h3>{product.name}{product.hindi_name && ` (${product.hindi_name})`}</h3>
          </div>
          <span className="product-rating">★ {product.rating}</span>
        </div>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__bottom">
          <div>
            <strong>{product.price}</strong>
            <small className="product-card__weight">
              250 g · Premium quality
            </small>
          </div>
          <div className="product-card__actions">
            <button className="text-button" onClick={onCart}>
              Add to cart <ArrowUpRight size={14} />
            </button>
            <button
              className="text-button text-button--secondary"
              onClick={onBuy}
            >
              Buy now <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductDetailPage({
  product,
  liked,
  toggleWishlist,
  addToCart,
  navigate,
}: {
  product: Product;
  liked: boolean;
  toggleWishlist: () => void;
  addToCart: (product: Product, weight?: Weight, quantity?: number) => void;
  navigate: (path: string) => void;
}) {
  const [weight, setWeight] = useState<Weight>("250g");
  const [quantity, setQuantity] = useState(1);
  const [gallery, setGallery] = useState(1);
  const selectedWeight =
    weights.find((item) => item.label === weight) ?? weights[1];
  const selectedVariant = product.variants?.find(
    (v) => v.weight_label === weight,
  );
  const total =
    (selectedVariant
      ? selectedVariant.price
      : Math.round(numericPrice(product.price) * selectedWeight.multiplier)) *
    quantity;
  const galleryImages = weights.map(({ label }) =>
    productImage(product, label),
  );
  const shareProduct = () => {
    void navigator.clipboard?.writeText(window.location.href);
  };
  const benefits =
    product.category === "Nuts"
      ? [
          "Rich in protein",
          "High in vitamin E",
          "Heart healthy",
          "Natural energy source",
        ]
      : product.category === "Seeds"
        ? [
            "Mineral rich",
            "High fibre",
            "Plant-powered goodness",
            "Daily nourishment",
          ]
        : [
            "Naturally aromatic",
            "Antioxidant rich",
            "Warming character",
            "Kitchen essential",
          ];
  return (
    <main className="product-detail">
      <button
        className="product-detail__back"
        onClick={() => navigate("/shop")}
      >
        <ArrowLeft size={15} /> Back to the collection
      </button>
      <div className="product-detail__layout">
        <section
          className="product-gallery"
          aria-label={`${product.name} image gallery`}
        >
          <div className="product-gallery__main">
            <img
              src={galleryImages[gallery]}
              alt={`${product.name} ${weight} packaging`}
            />
            <span className="product-gallery__zoom">Hover to explore</span>
          </div>
          <div className="product-gallery__thumbs">
            {galleryImages.map((image, index) => (
              <button
                key={image}
                className={gallery === index ? "is-active" : ""}
                onClick={() => {
                  setGallery(index);
                  setWeight(weights[index].label);
                }}
              >
                <img
                  src={image}
                  alt={`${product.name} ${weights[index].label} thumbnail`}
                />
                <small>{weights[index].label}</small>
              </button>
            ))}
          </div>
        </section>
        <section className="product-detail__copy">
          <p className="eyebrow">
            {product.category} · {product.origin} · selected quality
          </p>
          <div className="product-detail__title-row">
            <h1>{product.name}{product.hindi_name && ` (${product.hindi_name})`}</h1>
            <div className="detail-actions">
              <button
                className={`detail-wish ${liked ? "is-active" : ""}`}
                onClick={toggleWishlist}
                aria-label="Wishlist product"
              >
                <Heart size={19} fill={liked ? "currentColor" : "none"} />
              </button>
              <button className="detail-share" onClick={shareProduct}>
                Share
              </button>
            </div>
          </div>
          <div className="product-detail__rating">
            <span>★ {product.rating}</span>
            <span>·</span>
            <span>128 verified reviews</span>
            <span className="product-detail__badge">
              <BadgeCheck size={14} /> Premium
            </span>
          </div>
          <p className="product-detail__lede">
            {product.description} Thoughtfully selected and freshly sealed for a
            more generous everyday.
          </p>
          <p className="product-detail__long">
            A considered pantry staple from the NAAVORI collection, gathered for
            texture, provenance and a clean, expressive finish. Naturally grown,
            quality checked and packed close to source.
          </p>
          <div className="product-purchase">
            <div className="purchase-row">
              <div>
                <span className="purchase-label">Choose your weight</span>
                <div className="weight-options">
                  {weights.map((item, index) => (
                    <button
                      key={item.label}
                      className={weight === item.label ? "is-active" : ""}
                      onClick={() => {
                        setWeight(item.label);
                        setGallery(index);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="purchase-stock">
                <span className="stock-dot" /> In stock
              </div>
            </div>
            <div className="purchase-row purchase-row--price">
              <strong>{money(total)}</strong>
              <span>Inclusive of all taxes</span>
            </div>
            <div className="purchase-actions">
              <div className="quantity-control">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity((value) => value + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
              <button
                className="button button--dark"
                onClick={() => addToCart(product, weight, quantity)}
              >
                Add to cart <ShoppingBag size={16} />
              </button>
              <button
                className="button button--gold"
                onClick={() => {
                  addToCart(product, weight, quantity);
                  navigate("/checkout");
                }}
              >
                Buy now <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="purchase-perks">
              <span>
                <PackageCheck size={15} /> Freshly packed
              </span>
              <span>
                <ShieldCheck size={15} /> Secure checkout
              </span>
              <span>
                <TruckIcon /> Pan-India delivery from Varanasi
              </span>
            </div>
          </div>
          <div className="product-facts">
            <div>
              <p className="eyebrow">Origin</p>
              <strong>{product.origin}, India</strong>
            </div>
            <div>
              <p className="eyebrow">Storage</p>
              <strong>Cool, dry place</strong>
            </div>
            <div>
              <p className="eyebrow">Ingredients</p>
              <strong>100% natural {product.name.toLowerCase()}</strong>
            </div>
          </div>
        </section>
      </div>
      <section className="product-detail__standards">
        <div>
          <p className="eyebrow">The NAAVORI standard</p>
          <h2>
            Goodness, <em>with provenance.</em>
          </h2>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <div key={benefit}>
              <Leaf size={17} />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function TruckIcon() {
  return (
    <span className="truck-icon" aria-hidden="true">
      ↗
    </span>
  );
}

function ProductLinkCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  return (
    <button className="origin-product-chip" onClick={onClick}>
      <span className="origin-product-chip__icon">
        {product.category === "Nuts"
          ? "◌"
          : product.category === "Seeds"
            ? "✦"
            : "⌁"}
      </span>
      <span>
        <strong>{product.name}</strong>
        <small>
          {product.category} · {product.origin}
        </small>
      </span>
      <ArrowUpRight size={14} />
    </button>
  );
}

function BuilderVisualizer({
  kind,
  selected,
  options,
}: {
  kind: BuilderKind;
  selected: string[];
  options: BuilderOption[];
}) {
  const selectedOptions = selected.flatMap((id) => {
    const option = options.find((item) => item.id === id);
    return option ? [option] : [];
  });
  return (
    <div className={`builder-box builder-box--${kind}`}>
      <div className="builder-box__halo" />
      <div className="builder-box__lid">
        <span>NAAVORI</span>
        <small>THE CUSTOM EDIT</small>
      </div>
      <div className="builder-box__contents">
        {selectedOptions.length === 0 ? (
          <div className="builder-box__empty">
            Choose ingredients
            <br />
            <small>your box will fill here</small>
          </div>
        ) : (
          selectedOptions.map((option, index) => {
            const product = findProduct(option.productId);
            return product ? (
              <img
                key={`${option.id}-${index}`}
                className="builder-ingredient"
                style={
                  {
                    "--i": index,
                    "--count": selectedOptions.length,
                  } as CSSProperties
                }
                src={productImage(product, "100g")}
                alt={`${option.label} ingredient`}
              />
            ) : null;
          })
        )}
      </div>
      <div className="builder-box__label">
        <strong>{selected.length * 25 || 0}g</strong>
        <span>hand finished</span>
      </div>
    </div>
  );
}

function BuilderExperience({
  kind,
  addCustomToCart,
}: {
  kind: BuilderKind;
  addCustomToCart: (
    kind: BuilderKind,
    ids: string[],
    grams: number,
    price: number,
  ) => void;
}) {
  const data = builderData[kind];
  const [selected, setSelected] = useState<string[]>(
    data.options
      .slice(0, kind === "spice-blend" ? 2 : 3)
      .map((option) => option.id),
  );
  const [grams, setGrams] = useState(250);
  const price = Math.max(
    0,
    Math.round(
      ((selected.reduce((sum, id) => {
        const option = data.options.find((item) => item.id === id);
        const product = option ? findProduct(option.productId) : undefined;
        return sum + (product ? numericPrice(product.price) : 0);
      }, 0) *
        (grams / 250)) /
        Math.max(1, selected.length)) *
        1.2,
    ),
  );
  return (
    <div className="builder-experience">
      <div className="builder-experience__preview">
        <BuilderVisualizer
          kind={kind}
          selected={selected}
          options={data.options}
        />
        <div className="builder-experience__proof">
          <span>
            <Check size={13} /> Single origin
          </span>
          <span>
            <Check size={13} /> No preservatives
          </span>
          <span>
            <Check size={13} /> Gift ready
          </span>
        </div>
      </div>
      <div className="builder-experience__controls">
        <p className="eyebrow">Choose your ingredients</p>
        <div className="builder-option-grid">
          {data.options.map((option) => (
            <button
              key={option.id}
              className={selected.includes(option.id) ? "is-selected" : ""}
              onClick={() =>
                setSelected((current) =>
                  current.includes(option.id)
                    ? current.filter((item) => item !== option.id)
                    : [...current, option.id],
                )
              }
            >
              <span className="builder-option__check">
                {selected.includes(option.id) ? (
                  <Check size={13} />
                ) : (
                  <Plus size={13} />
                )}
              </span>
              <span>
                <strong>{option.label}</strong>
                <small>{option.note}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="builder-size-row">
          <span>Box size</span>
          <div>
            {[150, 250, 450].map((value) => (
              <button
                key={value}
                className={grams === value ? "is-active" : ""}
                onClick={() => setGrams(value)}
              >
                {value}g
              </button>
            ))}
          </div>
        </div>
        <div className="builder-total">
          <span>Estimated edit</span>
          <strong>{money(price)}</strong>
        </div>
        <button
          className="button button--dark button--full"
          disabled={!selected.length}
          onClick={() => addCustomToCart(kind, selected, grams, price)}
        >
          Add this custom edit <ShoppingBag size={15} />
        </button>
        <p className="builder-note">
          Your final blend is weighed, sealed and finished by hand.
        </p>
      </div>
    </div>
  );
}

function BuilderShowcase({
  navigate,
  addCustomToCart,
}: {
  navigate: (path: string) => void;
  addCustomToCart: (
    kind: BuilderKind,
    ids: string[],
    grams: number,
    price: number,
  ) => void;
}) {
  return (
    <section className="builders section-pad" id="builders">
      <div className="section-heading section-heading--split" data-reveal>
        <div>
          <p className="eyebrow">04 · The custom edit</p>
          <h2>
            Build a ritual
            <br />
            <em>of your own.</em>
          </h2>
        </div>
        <p className="section-intro">
          Three premium ways to compose something personal — with real NAAVORI
          ingredients, a gift-ready finish and a little more intention.
        </p>
      </div>
      <div className="builder-tiles">
        {(Object.keys(builderData) as BuilderKind[]).map((kind, index) => {
          const data = builderData[kind];
          return (
            <button
              key={kind}
              className={`builder-tile builder-tile--${kind}`}
              onClick={() => navigate(`/build/${kind}`)}
              data-reveal
            >
              <span className="builder-tile__number">0{index + 1}</span>
              <img
                src={asset(data.image)}
                alt={`${data.label} NAAVORI packaging`}
                loading="lazy"
              />
              <span className="builder-tile__copy">
                <p className="eyebrow">{data.kicker}</p>
                <h3>{data.title}</h3>
                <em>{data.copy}</em>
                <strong>
                  Start composing <ArrowUpRight size={14} />
                </strong>
              </span>
            </button>
          );
        })}
      </div>
      <div className="builder-inline">
        <BuilderExperience kind="nut-mix" addCustomToCart={addCustomToCart} />
      </div>
    </section>
  );
}
function OriginMap({
  activeOrigin,
  setActiveOrigin,
  setQuickView,
  navigate,
}: {
  activeOrigin: OriginKey;
  setActiveOrigin: (origin: OriginKey) => void;
  setQuickView: (product: Product) => void;
  navigate: (path: string) => void;
}) {
  const currentOrigin = origins[activeOrigin];
  const originProducts = currentOrigin.products
    .map((name) => catalogue.find((product) => product.name === name))
    .filter((product): product is Product => Boolean(product));
  return (
    <section className="origin section-pad" id="origin">
      <div className="origin__top" data-reveal>
        <div>
          <p className="eyebrow">05 · Shop by origin</p>
          <h2>
            Every flavour has
            <br />
            <em>a place.</em>
          </h2>
        </div>
        <p className="section-intro">
          An interactive atlas of the landscapes behind each ingredient — and
          the people who make them worth knowing.
        </p>
      </div>
      <div
        className="origin__experience origin__experience--immersive"
        data-reveal
      >
        <div
          className={`origin__map origin__map--${activeOrigin.toLowerCase().replaceAll(" ", "-")}`}
        >
          <div className="origin__map-stage">
            <div className="origin__map-glow" />
            <svg
              className="india-map-shape"
              viewBox="0 0 300 420"
              aria-hidden="true"
            >
              <path d="M100 16 139 29 163 52 184 61 179 87 204 108 188 136 211 161 200 188 222 208 211 233 229 259 212 280 195 312 172 340 152 389 126 354 112 322 92 300 78 274 65 243 43 220 51 194 32 172 57 149 44 126 65 103 58 77 76 59 72 37Z" />
            </svg>
            <div className="map-ring map-ring--one" />
            <div className="map-ring map-ring--two" />
            <div className="map-ring map-ring--three" />
            {(Object.keys(origins) as OriginKey[]).map((origin) => (
              <button
                key={origin}
                className={`map-pin map-pin--${origin.toLowerCase().replaceAll(" ", "-")} ${activeOrigin === origin ? "is-active" : ""}`}
                onClick={() => setActiveOrigin(origin)}
                aria-pressed={activeOrigin === origin}
                aria-label={`Explore ${origin}`}
              >
                <span className="map-pin__dot" />
                <strong>{origin}</strong>
                <small className="map-pin__tooltip">Explore {origin}</small>
              </button>
            ))}
            <aside className="origin__popup" aria-live="polite">
              <img
                src={asset(currentOrigin.image)}
                alt={`${activeOrigin} origin composition`}
                loading="lazy"
              />
              <div>
                <p className="eyebrow">
                  {activeOrigin} · {currentOrigin.region}
                </p>
                <h3>{currentOrigin.title}</h3>
                <p>{currentOrigin.copy}</p>
                <div className="origin__ingredients">
                  {currentOrigin.ingredients.map((ingredient) => (
                    <span key={ingredient}>{ingredient}</span>
                  ))}
                </div>
                <div className="origin__popup-products">
                  {originProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setQuickView(product)}
                    >
                      {product.name}
                      <ArrowUpRight size={13} />
                    </button>
                  ))}
                </div>
                <button
                  className="origin__popup-cta"
                  onClick={() =>
                    navigate(`/shop?origin=${encodeURIComponent(activeOrigin)}`)
                  }
                >
                  Explore this origin <ArrowUpRight size={13} />
                </button>
              </div>
            </aside>
            <span className="map-caption">INDIA · ORIGINS OF THE EXOTIC</span>
          </div>
        </div>
      </div>
      <div className="origin__recommendations">
        <p className="eyebrow">A taste of {activeOrigin}</p>
        <div className="origin__mini-grid">
          {originProducts.slice(0, 3).map((product) => (
            <button
              key={product.id}
              className="mini-product"
              onClick={() => setQuickView(product)}
            >
              <span
                style={{
                  backgroundImage: `url(${productImage(product)})`,
                  backgroundPosition: product.imagePosition,
                }}
              />
              <strong>{product.name}</strong>
              <small>{product.price}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function RouteChrome({
  route,
  navigate,
  cartCount,
  wishlistCount,
}: {
  route: string;
  navigate: (path: string) => void;
  cartCount: number;
  wishlistCount: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="route-header">
      <button className="header-brand" onClick={() => navigate("/")}>
        <LogoImage />
      </button>
      <nav className={open ? "route-nav route-nav--open" : "route-nav"}>
        <button
          className={route === "/" ? "is-active" : ""}
          onClick={() => navigate("/")}
        >
          Home
        </button>
        <button
          className={route === "/shop" ? "is-active" : ""}
          onClick={() => navigate("/shop")}
        >
          Shop
        </button>
        <button
          className={route.startsWith("/build/") ? "is-active" : ""}
          onClick={() => navigate("/build/nut-mix")}
        >
          Build
        </button>
        <button
          className={route === "/gifting" ? "is-active" : ""}
          onClick={() => navigate("/gifting")}
        >
          Gifting
        </button>
        <button onClick={() => navigate("/nuts")}>Collections</button>
        <button
          className={route === "/about" ? "is-active" : ""}
          onClick={() => navigate("/about")}
        >
          About
        </button>
        <button
          className={route === "/reviews" ? "is-active" : ""}
          onClick={() => navigate("/reviews")}
        >
          Reviews
        </button>
        <button
          className={route === "/contact" ? "is-active" : ""}
          onClick={() => navigate("/contact")}
        >
          Contact
        </button>
      </nav>
      <div className="route-actions">
        <button
          className="icon-button route-user"
          onClick={() =>
            navigate(
              window.localStorage.getItem("customer_email")
                ? "/account"
                : "/login",
            )
          }
          aria-label="Account"
        >
          <User size={18} />
        </button>
        <button
          className="icon-button route-wishlist"
          onClick={() => navigate("/wishlist")}
          aria-label="Wishlist"
        >
          <Heart size={18} />
          <span>{wishlistCount}</span>
        </button>
        <button
          className="icon-button cart-button"
          onClick={() => navigate("/cart")}
          aria-label="Shopping bag"
        >
          <ShoppingBag size={18} />
          <span>{cartCount}</span>
        </button>
        <button
          className="menu-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

function ShopBuilderCards({ navigate }: { navigate: (path: string) => void }) {
  return (
    <section className="shop-builders">
      <div className="shop-builders__heading">
        <p className="eyebrow">Make it yours</p>
        <h2>
          Compose something
          <br />
          <em>personal.</em>
        </h2>
      </div>
      <div className="shop-builders__grid">
        {(Object.keys(builderData) as BuilderKind[]).map((kind) => (
          <button
            key={kind}
            className={`shop-builder-card shop-builder-card--${kind}`}
            onClick={() => navigate(`/build/${kind}`)}
          >
            <img
              src={asset(builderData[kind].image)}
              alt={`${builderData[kind].label} builder`}
              loading="lazy"
            />
            <span>
              <p className="eyebrow">{builderData[kind].label}</p>
              <h3>{builderData[kind].title}</h3>
              <strong>
                Open builder <ArrowUpRight size={14} />
              </strong>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProductGrid({
  items,
  wishlist,
  toggleWishlist,
  addToCart,
  buyNow,
  navigate,
}: {
  items: Product[];
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  addToCart: (product: Product) => void;
  buyNow: (product: Product) => void;
  navigate: (path: string) => void;
}) {
  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          liked={wishlist.includes(product.id)}
          onLike={() => toggleWishlist(product.id)}
          onCart={() => addToCart(product)}
          onBuy={() => buyNow(product)}
          onQuickView={() => navigate(`/product/${product.id}`)}
        />
      ))}
    </div>
  );
}

function ShopPage({
  products,
  wishlist,
  toggleWishlist,
  addToCart,
  buyNow,
  navigate,
}: {
  products: Product[];
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  addToCart: (product: Product) => void;
  buyNow: (product: Product) => void;
  navigate: (path: string) => void;
}) {
  const [category, setCategory] = useState<"All" | Category>("All");
  const [query, setQuery] = useState(
    new URLSearchParams(window.location.search).get("query") ?? "",
  );
  const [sort, setSort] = useState("featured");
  const originFilter =
    new URLSearchParams(window.location.search).get("origin") ?? "";
  const items = useMemo(() => {
    const filtered = products.filter(
      (product) =>
        (!originFilter || product.origin === originFilter) &&
        (category === "All" || product.category === category) &&
        `${product.name} ${product.origin}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
    return [...filtered].sort((a, b) =>
      sort === "price-low"
        ? numericPrice(a.price) - numericPrice(b.price)
        : sort === "price-high"
          ? numericPrice(b.price) - numericPrice(a.price)
          : 0,
    );
  }, [products, category, query, sort, originFilter]);
  return (
    <>
      <section className="page-hero page-hero--shop">
        <p className="eyebrow">
          The collection · {products.length} authentic products
        </p>
        <h1>
          Shop the
          <br />
          <em>pantry.</em>
        </h1>
        <p>
          From valley-grown nuts to spice-coast aromatics, every package carries
          a sense of place.
        </p>
      </section>
      <main className="shop-page">
        <ShopBuilderCards navigate={navigate} />
        <div className="shop-toolbar">
          <div className="shop-categories">
            <button
              className={category === "All" ? "is-active" : ""}
              onClick={() => setCategory("All")}
            >
              All
            </button>
            {(["Nuts", "Seeds", "Spices"] as const).map((item) => (
              <button
                key={item}
                className={category === item ? "is-active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="shop-tools">
            <label className="shop-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ingredients"
              />
            </label>
            <label className="shop-sort">
              <SlidersHorizontal size={15} />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
        <div className="shop-summary">
          <p>
            {items.length} ingredients{originFilter ? ` · ${originFilter}` : ""}
          </p>
          <button onClick={() => navigate("/nuts")}>
            Browse category pages <ArrowUpRight size={14} />
          </button>
        </div>
        <ProductGrid
          items={items}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          buyNow={buyNow}
          navigate={navigate}
        />
        {items.length === 0 && (
          <div className="empty-shop">
            <Search size={21} />
            <h3>Nothing found in this edit.</h3>
            <p>Try another ingredient, origin or category.</p>
          </div>
        )}
      </main>
    </>
  );
}

function CategoryPage({
  products,
  kind,
  wishlist,
  toggleWishlist,
  addToCart,
  buyNow,
  navigate,
}: {
  products: Product[];
  kind: Category;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  addToCart: (product: Product) => void;
  buyNow: (product: Product) => void;
  navigate: (path: string) => void;
}) {
  const meta = {
    Nuts: {
      kicker: "01 · The nut archive",
      title: "Nuts with a\nquiet richness.",
      copy: "Whole, buttery, sun-warmed and selected for the kind of crunch that makes a pause feel complete.",
      origin:
        "From cool valleys to coastal orchards, our nuts carry the character of their landscape.",
      benefit:
        "A daily source of considered energy, natural goodness and deeply satisfying texture.",
    },
    Seeds: {
      kicker: "02 · The seed archive",
      title: "Small ingredients.\nQuiet power.",
      copy: "A considered collection of mineral-rich seeds, gathered for their texture, versatility and everyday nourishment.",
      origin:
        "From Gujarat’s warm fields to Uttarakhand’s clear mountain air, these tiny ingredients travel well.",
      benefit:
        "Sprinkle, bake, blend or simply keep them close for a thoughtful pantry ritual.",
    },
    Spices: {
      kicker: "03 · The spice archive",
      title: "Warmth,\nwith a sense of place.",
      copy: "Aromatic botanicals and whole spices, sourced from India’s most expressive growing regions.",
      origin:
        "Our spice trail moves from Malabar pepper gardens to saffron fields in the north.",
      benefit:
        "A little warmth transforms the everyday — and connects a dish to where it came from.",
    },
  }[kind];
  const items = products.filter((product) => product.category === kind);
  return (
    <>
      <section
        className="category-hero page-hero"
        style={
          {
            "--category-image": `url(${asset(`compositions/category-${kind.toLowerCase()}.webp`)})`,
            "--category-position": "center",
          } as CSSProperties
        }
      >
        <p className="eyebrow">{meta.kicker}</p>
        <h1>
          {meta.title.split("\n").map((line) => (
            <span key={line}>
              <em>{line}</em>
              <br />
            </span>
          ))}
        </h1>
        <p>{meta.copy}</p>
      </section>
      <main className="category-page">
        <div className="category-page__intro">
          <div>
            <p className="eyebrow">The {kind.toLowerCase()} edit</p>
            <h2>
              Selected for
              <br />
              <em>the everyday.</em>
            </h2>
          </div>
          <div>
            <p>{meta.benefit}</p>
            <span className="category-page__origin">
              <MapPin size={15} /> {meta.origin}
            </span>
          </div>
        </div>
        <ProductGrid
          items={items}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          buyNow={buyNow}
          navigate={navigate}
        />
        <div className="category-page__back">
          <button className="line-button" onClick={() => navigate("/shop")}>
            <ArrowLeft size={15} /> Back to all ingredients
          </button>
        </div>
      </main>
    </>
  );
}

function BuilderPage({
  kind,
  addCustomToCart,
  navigate,
}: {
  kind: BuilderKind;
  addCustomToCart: (
    kind: BuilderKind,
    ids: string[],
    grams: number,
    price: number,
  ) => void;
  navigate: (path: string) => void;
}) {
  const data = builderData[kind];
  return (
    <>
      <section className="builder-page-hero page-hero">
        <p className="eyebrow">{data.kicker}</p>
        <h1>
          {data.title.split(" ").slice(0, -1).join(" ")}
          <br />
          <em>{data.title.split(" ").at(-1)}</em>
        </h1>
        <p>
          {data.copy} Every selection is local, real and ready to become part of
          your ritual.
        </p>
      </section>
      <main className="builder-page">
        <button
          className="product-detail__back"
          onClick={() => navigate("/shop")}
        >
          <ArrowLeft size={15} /> Back to the collection
        </button>
        <BuilderExperience kind={kind} addCustomToCart={addCustomToCart} />
        <div className="builder-page__story">
          <p className="eyebrow">The NAAVORI promise</p>
          <h2>
            Small batch.
            <br />
            <em>Beautifully finished.</em>
          </h2>
          <p>
            We keep the source visible, the ingredient honest and the final
            presentation worthy of the person receiving it.
          </p>
        </div>
      </main>
    </>
  );
}

function ContactPage() {
  return (
    <>
      <section className="contact-hero page-hero">
        <div className="contact-hero__copy">
          <p className="eyebrow">A considered conversation</p>
          <h1>
            Come say
            <br />
            <em>hello.</em>
          </h1>
          <p>
            For sourcing questions, gifting conversations or simply a note from
            the pantry, our door is open.
          </p>
        </div>
        <div className="contact-hero__visual">
          <img
            src={asset("products-official/dry-coconut-250g.webp")}
            alt="NAAVORI Premium Dry Coconut packaging"
            loading="eager"
          />
          <span>Freshly packed · Varanasi</span>
        </div>
      </section>
      <section className="contact-strip section-pad">
        <div>
          <p className="eyebrow">Visit the house</p>
          <strong>
            K63/112, Nakkash
            <br />
            Bhoot Bhairav, Varanasi – 221001
          </strong>
        </div>
        <div>
          <p className="eyebrow">Call the concierge</p>
          <a href="tel:+91838819334">+91 838819334</a>
        </div>
        <div>
          <p className="eyebrow">Write with care</p>
          <a href="mailto:concierge@naavorinuts.com">
            concierge@naavorinuts.com
          </a>
        </div>
      </section>
      <section className="simple-detail section-pad">
        <div className="simple-detail__mark">
          <Mail size={24} />
        </div>
        <p className="eyebrow">We reply with care</p>
        <h2>
          Let’s make something
          <br />
          <em>beautiful.</em>
        </h2>
        <p>
          Every part of the NAAVORI experience is designed to leave space for
          what matters: flavour, provenance, texture and the people behind it.
        </p>
      </section>
    </>
  );
}

function SimplePage({
  type,
  navigate,
}: {
  type: "about" | "our-story";
  navigate: (path: string) => void;
}) {
  const content =
    type === "our-story"
      ? {
          eyebrow: "The NAAVORI story",
          title: "Rooted in India.\nMade for tomorrow.",
          copy: "NAAVORI brings together the richness of Indian landscapes and a modern ritual of care — one ingredient, one relationship and one beautiful detail at a time.",
        }
      : {
          eyebrow: "About the house",
          title: "A quieter kind\nof indulgence.",
          copy: "We make pantry staples feel worth pausing for. Not louder, not busier — simply more considered.",
        };
  return (
    <>
      <section className="simple-page page-hero">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>
          {content.title.split("\n").map((line) => (
            <span key={line}>
              <em>{line}</em>
              <br />
            </span>
          ))}
        </h1>
        <p>{content.copy}</p>
        <button
          className="button button--dark"
          onClick={() => navigate("/shop")}
        >
          Explore the collection <ArrowUpRight size={16} />
        </button>
      </section>
      <section className="simple-detail section-pad">
        <div className="simple-detail__mark">
          <Home size={24} />
        </div>
        <p className="eyebrow">Pure origins · real goodness</p>
        <h2>
          The details are
          <br />
          <em>the difference.</em>
        </h2>
        <p>
          Single origin, hand selected, 100% natural, no chemicals, no
          preservatives, small batch and carefully curated — this is why NAAVORI
          belongs in a different part of the pantry.
        </p>
      </section>
    </>
  );
}

function OrderTotals({ cart }: { cart: CartLine[] }) {
  const subtotal = cart.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  const shipping = subtotal === 0 ? 0 : 80;
  const tax = Math.round(subtotal * 0.05);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

function CartPage({
  cart,
  updateQuantity,
  removeLine,
  navigate,
}: {
  cart: CartLine[];
  updateQuantity: (id: string, delta: number) => void;
  removeLine: (id: string) => void;
  navigate: (path: string) => void;
}) {
  const totals = OrderTotals({ cart });
  return (
    <>
      <section className="page-hero cart-hero">
        <p className="eyebrow">Your considered edit</p>
        <h1>
          The shopping
          <br />
          <em>bag.</em>
        </h1>
        <p>
          Review your ingredients, adjust the quantities and take your edit
          through to a future-ready secure checkout.
        </p>
      </section>
      <main className="cart-page section-pad">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={25} />
            <h2>Your bag is waiting.</h2>
            <p>Begin with a beautiful ingredient from the collection.</p>
            <button
              className="button button--dark"
              onClick={() => navigate("/shop")}
            >
              Shop the collection <ArrowUpRight size={15} />
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-lines">
              <div className="cart-lines__header">
                <p className="eyebrow">
                  {cart.reduce((sum, line) => sum + line.quantity, 0)} items
                  selected
                </p>
                <button onClick={() => navigate("/shop")}>
                  Continue shopping <ArrowUpRight size={14} />
                </button>
              </div>
              {cart.map((line) => (
                <article className="cart-line" key={line.id}>
                  <img src={line.image} alt={`${line.name} packaging`} />
                  <div className="cart-line__info">
                    <p className="eyebrow">
                      {line.category} · {line.origin}
                    </p>
                    <h3>{line.name}</h3>
                    <span>
                      {line.weight}
                      {line.custom ? " · Custom edit" : " · Premium quality"}
                    </span>
                  </div>
                  <div className="cart-line__quantity">
                    <button
                      onClick={() => updateQuantity(line.id, -1)}
                      aria-label={`Decrease ${line.name}`}
                    >
                      <Minus size={13} />
                    </button>
                    <strong>{line.quantity}</strong>
                    <button
                      onClick={() => updateQuantity(line.id, 1)}
                      aria-label={`Increase ${line.name}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <strong className="cart-line__price">
                    {money(line.price * line.quantity)}
                  </strong>
                  <button
                    className="cart-line__remove"
                    onClick={() => removeLine(line.id)}
                    aria-label={`Remove ${line.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </article>
              ))}
            </section>
            <aside className="cart-summary">
              <p className="eyebrow">Order summary</p>
              <h2>
                Ready when
                <br />
                <em>you are.</em>
              </h2>
              <div className="cart-summary__rows">
                <span>
                  Product Price <strong>{money(totals.subtotal + totals.tax)}</strong>
                </span>
                <span>
                  Delivery Charge Fee <strong>₹80</strong>
                </span>
                <span className="cart-summary__total">
                  Total <strong>{money(totals.total)}</strong>
                </span>
              </div>
              <p className="cart-summary__note">
                Pan-India delivery from Varanasi. Flat ₹80 shipping charge. Taxes are estimated for this frontend demo.
              </p>
              <button
                className="button button--gold button--full"
                onClick={() => navigate("/checkout")}
              >
                Continue to billing <ArrowUpRight size={15} />
              </button>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function WishlistPage({
  wishlist,
  toggleWishlist,
  addToCart,
  buyNow,
  navigate,
}: {
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  addToCart: (product: Product) => void;
  buyNow: (product: Product) => void;
  navigate: (path: string) => void;
}) {
  const items = wishlist
    .map(findProduct)
    .filter((product): product is Product => Boolean(product));
  return (
    <>
      <section className="page-hero wishlist-hero">
        <p className="eyebrow">Saved with intention</p>
        <h1>
          Your quiet
          <br />
          <em>edit.</em>
        </h1>
        <p>A considered place for the ingredients you want to come back to.</p>
      </section>
      <main className="wishlist-page section-pad">
        {items.length ? (
          <ProductGrid
            items={items}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            addToCart={addToCart}
            buyNow={buyNow}
            navigate={navigate}
          />
        ) : (
          <div className="empty-cart">
            <Heart size={25} />
            <h2>Nothing saved yet.</h2>
            <p>Tap the heart on an ingredient to keep it close.</p>
            <button
              className="button button--dark"
              onClick={() => navigate("/shop")}
            >
              Discover the collection <ArrowUpRight size={15} />
            </button>
          </div>
        )}
      </main>
    </>
  );
}

function BillingPage({
  cart,
  navigate,
  setToast,
}: {
  cart: CartLine[];
  navigate: (path: string) => void;
  setToast: (message: string) => void;
}) {
  const totals = OrderTotals({ cart });
  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post("/public/coupons/apply", { code: couponCode, cart_total: totals.total });
      if (res.data.success) {
        setCouponDiscount(res.data.data.discount_amount);
        setAppliedCouponId(res.data.data.id);
        setToast("Coupon applied successfully!");
      } else {
        setToast(res.data.message || "Invalid coupon");
        setCouponDiscount(0);
        setAppliedCouponId(null);
      }
    } catch (e) {
      setToast("Failed to apply coupon");
    }
  };

  const finalTotal = totals.total - couponDiscount;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (paymentMethod === "online") {
      setToast("Initiating secure payment gateway...");
      try {
        const res = await api.post("/public/payment/order", {
          amount: finalTotal,
        });
        if (!res.data.success) throw new Error("Failed to create order");
        const { id: order_id, amount, currency } = res.data.data;
        const isMock = res.data.mock;

        if (isMock) {
          setTimeout(async () => {
            await processOrder("online", "paid");
          }, 1500);
          return;
        }

        const options = {
          key: "rzp_test_dummy", // Replace with real frontend key later
          amount: amount,
          currency: currency,
          name: "NAAVORI NUTS",
          description: "Premium Edit",
          order_id: order_id,
          handler: async function (response: any) {
            try {
              const verifyRes = await api.post(
                "/public/payment/verify",
                response,
              );
              if (verifyRes.data.success) {
                await processOrder("online", "paid");
              } else {
                setToast("Payment verification failed");
              }
            } catch (e) {
              setToast("Verification error");
            }
          },
          prefill: {
            name: (
              document.querySelector('input[name="name"]') as HTMLInputElement
            )?.value,
            email: (
              document.querySelector('input[name="email"]') as HTMLInputElement
            )?.value,
            contact: (
              document.querySelector('input[name="phone"]') as HTMLInputElement
            )?.value,
          },
          theme: { color: "#38243f" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function () {
          setToast("Payment failed");
        });
        rzp.open();
      } catch (err) {
        console.error(err);
        setToast("Payment initiation failed.");
      }
    } else {
      await processOrder("cod", "pending");
    }
  };

  const processOrder = async (method: string, paymentStatus: string) => {
    const formElement = document.getElementById(
      "billing-form",
    ) as HTMLFormElement;
    const formData = new FormData(formElement);
    const orderData = {
      shipping_name: formData.get("name"),
      shipping_phone: formData.get("phone"),
      shipping_email: formData.get("email"),
      shipping_address: formData.get("address"),
      shipping_city: formData.get("city"),
      shipping_state: formData.get("state"),
      shipping_pin_code: formData.get("pin"),
      subtotal: totals.subtotal,
      shipping_fee: totals.shipping,
      tax: totals.tax,
      discount: couponDiscount,
      coupon_id: appliedCouponId,
      total: finalTotal,
      payment_method: method,
      payment_status: paymentStatus,
      items: cart.map((item) => ({
        product_name: item.name,
        weight_label: item.weight,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await api.post("/public/orders", orderData);
      if (response.data.success) {
        setSubmitted(true);
        setToast(
          method === "cod"
            ? "Order placed! You can pay on delivery."
            : "Payment successful! Order placed.",
        );
        window.localStorage.removeItem("naavori-cart"); // Clear cart
      }
    } catch (error) {
      console.error(error);
      setToast("Failed to place order. Please try again.");
    }
  };

  if (!cart.length && !submitted)
    return (
      <main className="billing-page section-pad">
        <div className="empty-cart">
          <ShoppingBag size={25} />
          <h2>Your bag is empty.</h2>
          <button
            className="button button--dark"
            onClick={() => navigate("/shop")}
          >
            Return to the collection <ArrowUpRight size={15} />
          </button>
        </div>
      </main>
    );
  return (
    <>
      <section className="page-hero billing-hero">
        <p className="eyebrow">The final considered detail</p>
        <h1>
          Billing with
          <br />
          <em>care.</em>
        </h1>
        <p>A calm, future-ready billing page for your NAAVORI edit.</p>
      </section>
      <main className="billing-page section-pad">
        {submitted ? (
          <div className="billing-success">
            <div>
              <Check size={22} />
            </div>
            <p className="eyebrow">Your order is confirmed</p>
            <h2>
              Ready for the
              <br />
              <em>next step.</em>
            </h2>
            <p>
              Your order has been received and sent to our packing board. We
              will prepare it right away.
            </p>
            <button
              className="button button--dark"
              onClick={() => navigate("/shop")}
            >
              Continue exploring <ArrowUpRight size={15} />
            </button>
          </div>
        ) : (
          <div className="billing-layout">
            <form id="billing-form" className="billing-form" onSubmit={submit}>
              <div className="billing-form__header">
                <p className="eyebrow">01 · Delivery details</p>
                <h2>
                  Where should we
                  <br />
                  <em>send your edit?</em>
                </h2>
              </div>
              <div className="billing-fields">
                <label>
                  Customer name
                  <input
                    required
                    name="name"
                    placeholder="Your full name"
                    defaultValue={localStorage.getItem("customer_name") || ""}
                  />
                </label>
                <label>
                  Phone
                  <input
                    required
                    name="phone"
                    type="tel"
                    placeholder="+91"
                    defaultValue={localStorage.getItem("customer_phone") || ""}
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    defaultValue={localStorage.getItem("customer_email") || ""}
                  />
                </label>
                <label className="billing-field--wide">
                  Location Address
                  <input
                    required
                    name="address"
                    placeholder="Full location address (House no, Street, Landmark)"
                  />
                </label>
                <label>
                  City
                  <input required name="city" placeholder="City" />
                </label>
                <label>
                  State
                  <input required name="state" placeholder="State" />
                </label>
                <label>
                  PIN code
                  <input
                    required
                    name="pin"
                    inputMode="numeric"
                    placeholder="221001"
                  />
                </label>
              </div>
              <div className="payment-method">
                <p className="eyebrow">02 · Payment method</p>
                <label
                  className={`payment-option blinkit-payment ${paymentMethod === "online" ? "is-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />{" "}
                  <div className="payment-details">
                    <strong>Pay Online</strong>
                    <small>UPI, Cards, Wallets, Netbanking</small>
                  </div>
                  <BadgeCheck size={20} className="payment-icon" />
                </label>
                <label
                  className={`payment-option blinkit-payment ${paymentMethod === "cod" ? "is-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />{" "}
                  <div className="payment-details">
                    <strong>Cash on Delivery</strong>
                    <small>Pay at your doorstep</small>
                  </div>
                  <BadgeCheck size={20} className="payment-icon cod-icon" />
                </label>
              </div>
              <button
                className="button button--dark button--full"
                type="submit"
              >
                {paymentMethod === "online"
                  ? `Pay ${money(finalTotal)} & Place Order`
                  : `Place Order (COD ${money(finalTotal)})`}{" "}
                <ArrowUpRight size={15} />
              </button>
            </form>
            <aside className="billing-summary">
              <p className="eyebrow">03 · Order summary</p>
              <h2>
                Your
                <br />
                <em>selection.</em>
              </h2>
              <div className="billing-summary__items">
                {cart.map((line) => (
                  <div key={line.id}>
                    <img src={line.image} alt="" />
                    <span>
                      {line.name}
                      <small>
                        {line.weight} · Qty {line.quantity}
                      </small>
                    </span>
                    <strong>{money(line.price * line.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '20px', padding: '16px', background: '#fdfbf7', border: '1px dashed #d8c5b2', borderRadius: '8px' }}>
                <p className="eyebrow" style={{ marginBottom: '8px' }}>Have a promo code?</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textTransform: 'uppercase' }}
                  />
                  <button type="button" onClick={applyCoupon} style={{ padding: '8px 16px', backgroundColor: '#38243F', color: '#fff', border: 'none', borderRadius: '4px' }}>
                    Apply
                  </button>
                </div>
                {appliedCouponId && <p style={{ fontSize: '12px', color: '#52c41a', margin: '8px 0 0' }}>Coupon applied!</p>}
              </div>
              <div className="cart-summary__rows">
                <span>
                  Product Price <strong>{money(totals.subtotal + totals.tax)}</strong>
                </span>
                <span>
                  Delivery Charge Fee <strong>₹80</strong>
                </span>
                {couponDiscount > 0 && (
                  <span style={{ color: '#52c41a' }}>
                    Discount <strong>-{money(couponDiscount)}</strong>
                  </span>
                )}
                <span className="cart-summary__total">
                  Total <strong>{money(finalTotal)}</strong>
                </span>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function RouteFooter({ navigate }: { navigate: (path: string) => void }) {
  return (
    <footer className="route-footer">
      <button className="footer-lockup" onClick={() => navigate("/")}>
        <LogoImage light />
      </button>
      <span>Pure origins. Real goodness.</span>
      <div className="route-footer__contact">
        <span>K63/112, Nakkash · Varanasi</span>
        <a href="mailto:concierge@naavorinuts.com">concierge@naavorinuts.com</a>
      </div>
      <button onClick={() => navigate("/contact")}>
        Contact <ArrowUpRight size={14} />
      </button>
    </footer>
  );
}

function App() {
  const [forceRender, setForceRender] = useState(0);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(window.location.pathname || "/");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem("naavori-cart") ?? "[]",
      ) as CartLine[];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState("");
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [activeOrigin, setActiveOrigin] = useState<OriginKey>("Kashmir");
  const [testimonial, setTestimonial] = useState(0);
  const [newsletter, setNewsletter] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [liveReviews, setLiveReviews] = useState<any[]>(fallbackTestimonials);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    api
      .get("/reviews")
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setLiveReviews(res.data.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    api
      .get("/products?limit=100")
      .then((res) => {
        // Map database products to frontend Product interface
        const mappedProducts = res.data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          hindi_name: p.hindi_name,
          category: p.category_name as Category,
          origin: p.origin || "India",
          description: p.description,
          price: `₹${p.starting_price || 0}`,
          rating: "4.9",
          imagePosition: "center",
          packagingKey: p.slug, // Use slug for packagingKey which points to image
          variants: p.variants
            ? p.variants.map((v: any) => ({
                weight_label: v.weight_label,
                price: Number(v.price),
              }))
            : [],
        }));
        // Merge with existing hardcoded products if DB is empty, otherwise replace
        if (mappedProducts.length > 0) {
          setProducts(mappedProducts);
          setForceRender((prev) => prev + 1);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 1400);
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  useEffect(() => {
    const reveal = () =>
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((element) => {
          if (element.getBoundingClientRect().top < window.innerHeight * 0.9)
            element.classList.add("is-visible");
        });
    reveal();
    window.addEventListener("scroll", reveal, { passive: true });
    return () => window.removeEventListener("scroll", reveal);
  }, [loading, route]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    window.localStorage.setItem("naavori-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    document.body.style.overflow = quickView ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [quickView]);
  useEffect(() => {
    const listener = (event: Event) =>
      setToast((event as CustomEvent<string>).detail);
    window.addEventListener("naavori-toast", listener);
    return () => window.removeEventListener("naavori-toast", listener);
  }, []);
  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (path: string) => {
    history.pushState({}, "", path);
    setRoute(window.location.pathname || "/");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const toggleWishlist = (id: string) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setToast(
      wishlist.includes(id) ? "Removed from your edit" : "Saved to your edit",
    );
  };
  const addToCart = (
    product: Product,
    weight: Weight = "250g",
    quantity = 1,
  ) => {
    const variant = product.variants?.find((v) => v.weight_label === weight);
    const price = variant
      ? variant.price
      : Math.round(
          numericPrice(product.price) *
            (weights.find((item) => item.label === weight)?.multiplier ?? 1),
        );
    const id = `${product.id}-${weight}`;
    setCart((current) => {
      const existing = current.find((line) => line.id === id);
      return existing
        ? current.map((line) =>
            line.id === id
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          )
        : [
            ...current,
            {
              id,
              name: product.name,
              category: product.category,
              origin: product.origin,
              weight,
              price,
              quantity,
              image: productImage(product, weight),
            },
          ];
    });
    setToast(`${product.name} added to your edit`);
  };
  const addCustomToCart = (
    kind: BuilderKind,
    ids: string[],
    grams: number,
    price: number,
  ) => {
    const data = builderData[kind];
    const names = ids
      .map((id) => data.options.find((option) => option.id === id)?.label)
      .filter(Boolean)
      .join(" · ");
    const firstProduct = ids
      .map((id) => data.options.find((option) => option.id === id)?.productId)
      .map((id) => (id ? findProduct(id) : undefined))
      .find((product): product is Product => Boolean(product));
    const id = `custom-${kind}-${ids.slice().sort().join("-")}-${grams}`;
    setCart((current) => [
      ...current,
      {
        id,
        name: `Custom ${data.label}`,
        category: "Custom edit",
        origin: "NAAVORI studio",
        weight: `${grams}g`,
        price,
        quantity: 1,
        image: firstProduct ? productImage(firstProduct) : asset(data.image),
        custom: true,
      },
    ]);
    setToast(`${names || "Your custom edit"} added to your bag`);
  };
  const updateQuantity = (id: string, delta: number) =>
    setCart((current) =>
      current.map((line) =>
        line.id === id
          ? { ...line, quantity: Math.max(1, line.quantity + delta) }
          : line,
      ),
    );
  const removeLine = (id: string) =>
    setCart((current) => current.filter((line) => line.id !== id));
  const buyNow = (product: Product) => {
    addToCart(product);
    navigate("/checkout");
  };
  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletter.trim()) return;
    setNewsletterSent(true);
  };
  const handleHeroMove = (event: ReactMouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty(
      "--cursor-x",
      `${((event.clientX - rect.left) / rect.width) * 100}%`,
    );
    target.style.setProperty(
      "--cursor-y",
      `${((event.clientY - rect.top) / rect.height) * 100}%`,
    );
  };

  const renderHome = () => (
    <>
      <div className="site-shell">
        <header
          className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}
        >
          <button
            className="header-brand"
            onClick={() => goTo("top")}
            aria-label="Back to top"
          >
            <LogoImage />
          </button>
          <nav className={`main-nav ${menuOpen ? "main-nav--open" : ""}`}>
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/shop")}>Shop</button>
            <button onClick={() => goTo("builders")}>Build</button>
            <button onClick={() => navigate("/gifting")}>Gifting</button>
            <button onClick={() => goTo("origin")}>Origins</button>
            <button onClick={() => navigate("/about")}>About</button>
            <button onClick={() => navigate("/reviews")}>Reviews</button>
            <button onClick={() => navigate("/contact")}>Contact</button>
          </nav>
          <div className="header-actions">
            <button
              className={`icon-button search-button ${searchOpen ? "search-button--open" : ""}`}
              onClick={() => setSearchOpen((value) => !value)}
              aria-label="Search"
            >
              {searchOpen ? (
                <>
                  <Search size={17} />
                  <input
                    autoFocus
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && event.currentTarget.value)
                        navigate(
                          `/shop?query=${encodeURIComponent(event.currentTarget.value)}`,
                        );
                    }}
                    placeholder="Search ingredients"
                  />
                </>
              ) : (
                <Search size={18} />
              )}
            </button>
            <button
              className="icon-button"
              onClick={() =>
                navigate(
                  localStorage.getItem("customer_email")
                    ? "/account"
                    : "/login",
                )
              }
              aria-label="Account"
            >
              <User size={18} />
            </button>
            <button
              className="icon-button"
              onClick={() => navigate("/wishlist")}
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </button>
            <button
              className="icon-button cart-button"
              onClick={() => navigate("/cart")}
              aria-label="Shopping bag"
            >
              <ShoppingBag size={18} />
              <span>{cartCount}</span>
            </button>
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
        <main id="top">
          <section className="hero" onMouseMove={handleHeroMove}>
            <video
              className="hero__video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={asset("compositions/brand-reference.webp")}
            >
              <source src={asset("hero-video.mp4")} type="video/mp4" />
            </video>
            <div className="hero__veil" />
            <div className="hero__glow" />
            <div className="hero__particles" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="hero__content">
              <p className="eyebrow hero__eyebrow">
                <span className="eyebrow-dot" /> From India, with intention
              </p>
              <h1>
                Pure origins.
                <br />
                <em>Real goodness.</em>
              </h1>
              <p className="hero__copy">
                A considered collection of nuts, seeds and spices — selected
                from India&apos;s richest regions, crafted for everyday ritual.
              </p>
              <div className="hero__actions">
                <button
                  className="button button--dark"
                  onClick={() => navigate("/shop")}
                >
                  Shop the collection <ArrowUpRight size={16} />
                </button>
                <button
                  className="button button--quiet"
                  onClick={() => goTo("origin")}
                >
                  Explore our origins <ArrowDownRight size={16} />
                </button>
              </div>
            </div>
            <div className="hero__footer">
              <span>NAAVORI NUTS · EST. 2024</span>
              <button onClick={() => goTo("collection")} className="scroll-cue">
                <span /> Scroll to discover
              </button>
              <span className="hero__coordinates">15°29′N · 74°07′E</span>
            </div>
          </section>
          <section className="category-strip section-pad" id="collection">
            <div className="section-heading section-heading--split" data-reveal>
              <div>
                <p className="eyebrow">01 · The pantry, considered</p>
                <h2>
                  Begin with something
                  <br />
                  <em>beautiful.</em>
                </h2>
              </div>
              <p className="section-intro">
                Three families of ingredients. Countless ways to make the
                everyday more generous.
              </p>
            </div>
            <div className="category-grid">
              {[
                {
                  name: "Nuts",
                  descriptor: "The quiet luxury of a good crunch.",
                  image: "compositions/category-nuts.webp",
                  number: "01",
                },
                {
                  name: "Seeds",
                  descriptor: "Small ingredients. Considered nourishment.",
                  image: "compositions/category-seeds.webp",
                  number: "02",
                },
                {
                  name: "Spices",
                  descriptor: "A little warmth changes everything.",
                  image: "compositions/category-spices.webp",
                  number: "03",
                },
              ].map((category) => (
                <button
                  key={category.name}
                  className="category-card"
                  onClick={() => navigate(`/${category.name.toLowerCase()}`)}
                  data-reveal
                >
                  <span
                    className="category-card__image"
                    style={{
                      backgroundImage: `url(${asset(category.image)})`,
                      backgroundPosition: "center",
                    }}
                  />
                  <span className="category-card__veil" />
                  <span className="category-card__label">
                    <small>{category.number}</small>
                    <strong>{category.name}</strong>
                    <em>{category.descriptor}</em>
                  </span>
                  <ArrowUpRight className="category-card__arrow" size={20} />
                </button>
              ))}
            </div>
          </section>
          <section
            className="best-sellers section-pad section-pad--top"
            id="best-sellers"
          >
            <div className="section-heading section-heading--split" data-reveal>
              <div>
                <p className="eyebrow">02 · The edit</p>
                <h2>
                  Best sellers, <em>reconsidered.</em>
                </h2>
              </div>
              <button className="line-button" onClick={() => navigate("/shop")}>
                View all ingredients <ArrowUpRight size={15} />
              </button>
            </div>
            <ProductGrid
              items={products.slice(0, 6)}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
              buyNow={buyNow}
              navigate={navigate}
            />
          </section>
          <section className="manifesto section-pad" id="journal">
            <div className="manifesto__texture" />
            <div className="manifesto__content" data-reveal>
              <p className="eyebrow">A note from NAAVORI</p>
              <blockquote>
                “More than just nuts.
                <br />
                <em>It&apos;s a journey of India&apos;s richest regions.</em>”
              </blockquote>
              <p>
                We believe the best pantry staples carry a sense of place. In
                the way a walnut remembers a cold valley, or pepper holds the
                damp green air of the coast.
              </p>
              <button
                className="line-button line-button--light"
                onClick={() => goTo("origin")}
              >
                Read our story <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="manifesto__stamp">
              <LogoImage light />
              <span>
                Pure origins
                <br />
                Real goodness
              </span>
            </div>
          </section>
          <section className="showcase section-pad" id="showcase">
            <div className="showcase__heading" data-reveal>
              <div>
                <p className="eyebrow">03 · The collection, observed</p>
                <h2>
                  Meet the <em>ritual.</em>
                </h2>
              </div>
              <p className="section-intro">
                A considered still life of provenance, colour and texture — made
                lighter for a faster, quieter experience.
              </p>
            </div>
            <div
              className="showcase__stage showcase__stage--static"
              data-reveal
            >
              <img
                src={asset("compositions/brand-reference.webp")}
                alt="NAAVORI ingredients and original brand composition"
                loading="lazy"
              />
              <div className="showcase__caption">
                <span>
                  <Sparkles size={15} /> Original compositions
                </span>
                <span className="showcase__status">
                  <i /> Selected in India
                </span>
              </div>
            </div>
            <p className="showcase__note">
              Nuts · Seeds · Spices · Pure origins, real goodness.
            </p>
          </section>
          <section className="why section-pad">
            <div className="section-heading" data-reveal>
              <p className="eyebrow">04 · The NAAVORI standard</p>
              <h2>
                Goodness, <em>with standards.</em>
              </h2>
              <p className="section-intro">
                From the way we source to the way we seal, every detail is made
                to honour what nature already got right.
              </p>
            </div>
            <div className="reason-grid">
              {reasons.map(({ icon: Icon, eyebrow, title, copy }) => (
                <article className="reason-card" key={title} data-reveal>
                  <span className="reason-card__number">{eyebrow}</span>
                  <Icon size={22} strokeWidth={1.4} />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>
          <BuilderShowcase
            navigate={navigate}
            addCustomToCart={addCustomToCart}
          />
          <OriginMap
            activeOrigin={activeOrigin}
            setActiveOrigin={setActiveOrigin}
            setQuickView={setQuickView}
            navigate={navigate}
          />
          <section className="reviews section-pad" id="reviews">
            <div className="reviews__header" data-reveal>
              <p className="eyebrow">06 · Kind words</p>
              <span className="reviews__count">
                0{testimonial + 1} <i>/</i> 0{liveReviews.length}
              </span>
            </div>
            <div className="review-card" data-reveal>
              <span className="review-card__quote">“</span>
              <blockquote>{liveReviews[testimonial]?.review_text}</blockquote>
              <div className="review-card__byline">
                <strong>{liveReviews[testimonial]?.customer_name}</strong>
                <span>{liveReviews[testimonial]?.role}</span>
              </div>
              <div className="review-card__controls">
                <button
                  onClick={() =>
                    setTestimonial(
                      (testimonial - 1 + liveReviews.length) %
                        liveReviews.length,
                    )
                  }
                  aria-label="Previous review"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    setTestimonial((testimonial + 1) % liveReviews.length)
                  }
                  aria-label="Next review"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <button
                className="button button--quiet"
                onClick={() => navigate("/reviews")}
                style={{ marginTop: "24px" }}
              >
                Write a review <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
          <section
            className="newsletter section-pad"
            id="newsletter"
            data-reveal
          >
            <div className="newsletter__ornament">✦</div>
            <div className="newsletter__content">
              <p className="eyebrow">The NAAVORI letter</p>
              <h2>
                A little goodness,
                <br />
                <em>in your inbox.</em>
              </h2>
              <p>
                Seasonal stories, new harvests and considered ways to make the
                everyday beautiful.
              </p>
              {newsletterSent ? (
                <div className="newsletter__success">
                  <span>✦</span> You&apos;re on the list. See you soon.
                </div>
              ) : (
                <form onSubmit={submitNewsletter}>
                  <label className="sr-only" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={newsletter}
                    onChange={(event) => setNewsletter(event.target.value)}
                    placeholder="Your email address"
                  />
                  <button type="submit" aria-label="Subscribe">
                    <ArrowUpRight size={18} />
                  </button>
                </form>
              )}
              <small>
                By subscribing, you agree to hear from us. No noise, ever.
              </small>
            </div>
            <span className="newsletter__leaf newsletter__leaf--one" />
            <span className="newsletter__leaf newsletter__leaf--two" />
          </section>
        </main>
        <footer className="site-footer">
          <div className="site-footer__top">
            <div className="footer-brand">
              <button className="footer-lockup" onClick={() => goTo("top")}>
                <LogoImage light />
              </button>
              <p>
                Pure origins. Real goodness.
                <br />
                Rooted in India, crafted for tomorrow.
              </p>
              <p className="footer-contact">
                K63/112, Nakkash · Bhoot Bhairav
                <br />
                Varanasi – 221001
                <br />
                <a href="mailto:concierge@naavorinuts.com">
                  concierge@naavorinuts.com
                </a>
                <br />
                <a href="tel:+91838819334">+91 838819334</a>
              </p>
            </div>
            <div className="footer-column">
              <p className="eyebrow">Discover</p>
              <button onClick={() => goTo("collection")}>The collection</button>
              <button onClick={() => goTo("origin")}>Our origins</button>
              <button onClick={() => goTo("builders")}>Build your edit</button>
            </div>
            <div className="footer-column">
              <p className="eyebrow">Care</p>
              <button onClick={() => navigate("/contact")}>Contact us</button>
              <button onClick={() => navigate("/cart")}>
                Shipping & returns
              </button>
              <button onClick={() => setToast("FAQ preview coming soon")}>
                FAQs
              </button>
            </div>
            <div className="footer-column">
              <p className="eyebrow">Your edit</p>
              <button
                onClick={() =>
                  navigate(
                    localStorage.getItem("customer_email")
                      ? "/account"
                      : "/login",
                  )
                }
              >
                Sign in <User size={13} />
              </button>
              <button onClick={() => navigate("/wishlist")}>
                Wishlist <Heart size={13} />
              </button>
              <button onClick={() => navigate("/cart")}>
                Shopping bag <ShoppingBag size={13} />
              </button>
            </div>
          </div>
          <div className="site-footer__bottom">
            <span>© 2024 NAAVORI NUTS</span>
            <span>Made with intention in India</span>
            <span>
              <a
                href="/admin/login"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Admin Portal
              </a>{" "}
              · Privacy · Terms
            </span>
          </div>
        </footer>
      </div>
    </>
  );

  const detailProduct = route.startsWith("/product/")
    ? catalogue.find((item) => item.id === route.split("/")[2])
    : undefined;
  let routePage: ReactNode;
  if (detailProduct)
    routePage = (
      <ProductDetailPage
        product={detailProduct}
        liked={wishlist.includes(detailProduct.id)}
        toggleWishlist={() => toggleWishlist(detailProduct.id)}
        addToCart={addToCart}
        navigate={navigate}
      />
    );
  else if (route === "/shop")
    routePage = (
      <ShopPage
        products={products}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        buyNow={buyNow}
        navigate={navigate}
      />
    );
  else if (route === "/nuts" || route === "/seeds" || route === "/spices")
    routePage = (
      <CategoryPage
        products={products}
        kind={
          route
            .slice(1)
            .replace(/^./, (letter) => letter.toUpperCase()) as Category
        }
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        buyNow={buyNow}
        navigate={navigate}
      />
    );
  else if (route.startsWith("/build/"))
    routePage = (
      <BuilderPage
        kind={route.split("/")[2] as BuilderKind}
        addCustomToCart={addCustomToCart}
        navigate={navigate}
      />
    );
  else if (route === "/cart")
    routePage = (
      <CartPage
        cart={cart}
        updateQuantity={updateQuantity}
        removeLine={removeLine}
        navigate={navigate}
      />
    );
  else if (route === "/checkout")
    routePage = (
      <BillingPage cart={cart} navigate={navigate} setToast={setToast} />
    );
  else if (route === "/wishlist")
    routePage = (
      <WishlistPage
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        buyNow={buyNow}
        navigate={navigate}
      />
    );
  else if (route === "/login")
    routePage = <CustomerAuthPage navigate={navigate} setToast={setToast} />;
  else if (route === "/account")
    routePage = (
      <CustomerAccountPage
        navigate={navigate}
        wishlist={wishlist}
        cart={cart}
      />
    );
  else if (route === "/contact") routePage = <ContactPage />;
  else if (route === "/reviews")
    routePage = (
      <ReviewSubmissionPage navigate={navigate} setToast={setToast} />
    );
  else if (route === "/gifting")
    routePage = <GiftingPage navigate={navigate} addToCart={addToCart} catalogue={catalogue} />;
  else
    routePage = (
      <SimplePage
        type={route === "/our-story" ? "our-story" : "about"}
        navigate={navigate}
      />
    );

  if (route !== "/")
    return (
      <>
        <LoadingScreen done={!loading} />
        <RouteChrome
          route={route}
          navigate={navigate}
          cartCount={cartCount}
          wishlistCount={wishlist.length}
        />
        {routePage}
        <RouteFooter navigate={navigate} />
        {toast && (
          <div className="toast" role="status">
            <span>✦</span>
            {toast}
          </div>
        )}
        {quickView && (
          <QuickViewModal
            product={quickView}
            addToCart={addToCart}
            setQuickView={setQuickView}
          />
        )}
      </>
    );
  return (
    <>
      <LoadingScreen done={!loading} />
      {renderHome()}
      {toast && (
        <div className="toast" role="status">
          <span>✦</span>
          {toast}
        </div>
      )}
      {quickView && (
        <QuickViewModal
          product={quickView}
          addToCart={addToCart}
          setQuickView={setQuickView}
        />
      )}
    </>
  );
}

function QuickViewModal({
  product,
  addToCart,
  setQuickView,
}: {
  product: Product;
  addToCart: (product: Product) => void;
  setQuickView: (product: Product | null) => void;
}) {
  return (
    <div className="modal-backdrop" onClick={() => setQuickView(null)}>
      <div
        className="quick-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view ${product.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={() => setQuickView(null)}
          aria-label="Close quick view"
        >
          <X size={18} />
        </button>
        <ProductImage product={product} eager />
        <div className="quick-modal__content">
          <p className="eyebrow">
            {product.category} · {product.origin}
          </p>
          <h2>{product.name}{product.hindi_name && ` (${product.hindi_name})`}</h2>
          <p>{product.description}</p>
          <div className="quick-modal__price">
            <strong>{product.price}</strong>
            <span>★ {product.rating} · Selected quality</span>
          </div>
          <button
            className="button button--dark button--full"
            onClick={() => {
              addToCart(product);
              setQuickView(null);
            }}
          >
            Add to your edit <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
