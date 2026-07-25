import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  ArrowRight,
  Utensils,
  Scissors,
  Store as StoreIcon,
  Clock,
  ImagePlus,
} from "lucide-react";
import { seedIfNeeded, getVendorBySlug } from "../../lib/store";
import { formatINR } from "../../lib/utils";
import { CartProvider, useCart } from "../../lib/cart";
import Modal from "../../components/Modal";
import Logo from "../../components/Logo";

/**
 * Storefront page — customer-facing. Uses vendor's accent color.
 * Restaurant: cart-based order flow.
 * Salon: pick a service -> booking flow route.
 */
export default function StorefrontPage() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    seedIfNeeded();
    setVendor(getVendorBySlug(slug));
    setLoaded(true);
  }, [slug]);

  if (!loaded) return null;

  if (!vendor || !vendor.onboarded) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-soft border border-brand/30 grid place-items-center">
            <StoreIcon className="h-6 w-6 text-brand" />
          </div>
          <h1 className="mt-6 text-2xl font-display font-medium">Store not found</h1>
          <p className="mt-2 text-ink-secondary">The store <span className="font-mono text-brand">/{slug}</span> doesn't exist.</p>
          <Link to="/discover" className="btn-primary mt-6 inline-flex items-center gap-2">Browse stores <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    );
  }

  return (
    <CartProvider vendorSlug={vendor.slug}>
      <StorefrontContent vendor={vendor} />
    </CartProvider>
  );
}

function StorefrontContent({ vendor }) {
  const isRestaurant = vendor.businessType === "restaurant";
  const accentClass = isRestaurant ? "text-restaurant" : "text-salon";
  const accentBg = isRestaurant ? "bg-restaurant" : "bg-salon";
  const accentBgSoft = isRestaurant ? "bg-orange-500/15 border-orange-500/30" : "bg-amber-500/15 border-amber-500/30";

  const list = isRestaurant ? vendor.items : vendor.services;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(
    () =>
      list.filter(
        (it) =>
          it.available &&
          (cat === "all" || it.categoryId === cat) &&
          (q.trim() === "" || it.name.toLowerCase().includes(q.toLowerCase()))
      ),
    [list, cat, q]
  );

  return (
    <div className="min-h-screen">
      {/* Sticky compact header */}
      <header className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-bg-surface border border-line overflow-hidden grid place-items-center flex-shrink-0">
              {vendor.logo ? <img src={vendor.logo} alt="" className="h-full w-full object-cover" /> : <StoreIcon className="h-4 w-4 text-ink-muted" />}
            </div>
            <div className="min-w-0">
              <div className="font-display font-medium text-sm truncate">{vendor.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-muted truncate">
                {isRestaurant ? "Restaurant" : "Salon"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/discover" className="hidden sm:inline text-xs text-ink-secondary hover:text-ink-primary px-3 py-2 rounded-lg transition-colors" data-testid="store-back-discover">More stores</Link>
            {isRestaurant && <CartTrigger onOpen={() => setCartOpen(true)} accentBg={accentBg} />}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div
          className="h-56 sm:h-72 lg:h-96 bg-cover bg-center bg-bg-elevated"
          style={{ backgroundImage: vendor.coverImage ? `url(${vendor.coverImage})` : undefined }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-black/30" />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-surface p-6 sm:p-8"
          >
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-bg-elevated border border-line overflow-hidden grid place-items-center flex-shrink-0">
                {vendor.logo ? <img src={vendor.logo} alt="" className="h-full w-full object-cover" /> : <StoreIcon className="h-6 w-6 text-ink-muted" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${accentBgSoft} ${accentClass}`}>
                  {isRestaurant ? <Utensils className="h-3 w-3" /> : <Scissors className="h-3 w-3" />}
                  {isRestaurant ? "Restaurant" : "Salon"}
                </span>
                <h1 className="mt-3 text-2xl sm:text-4xl font-display font-medium tracking-tighter" data-testid="storefront-name">{vendor.name}</h1>
                {vendor.tagline && <p className="mt-1.5 text-ink-secondary">{vendor.tagline}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
                  {vendor.address && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {vendor.address}</span>}
                  {vendor.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {vendor.phone}</span>}
                </div>
              </div>
            </div>
            {vendor.description && (
              <p className="mt-6 pt-5 border-t border-line text-ink-secondary leading-relaxed">
                {vendor.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className={`text-xs uppercase tracking-widest ${accentClass}`}>{isRestaurant ? "Menu" : "Services"}</div>
            <h2 className="mt-2 text-2xl font-display font-medium tracking-tight">
              {isRestaurant ? "Explore the menu" : "Book a service"}
            </h2>
          </div>
          <div className="relative sm:max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${isRestaurant ? "menu" : "services"}...`}
              className="input-field pl-10"
              data-testid="storefront-search"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-2 mb-6">
          <CatChip active={cat === "all"} onClick={() => setCat("all")} testid="store-cat-all">All</CatChip>
          {vendor.categories.map((c) => (
            <CatChip
              key={c.id}
              active={cat === c.id}
              onClick={() => setCat(c.id)}
              testid={`store-cat-${c.id}`}
            >
              {c.name}
            </CatChip>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card-surface p-16 text-center">
            <div className="font-display text-lg">Nothing to show</div>
            <p className="mt-1 text-ink-secondary text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((it, i) => (
              <ItemCard
                key={it.id}
                item={it}
                isRestaurant={isRestaurant}
                accentClass={accentClass}
                onOpen={() => setSelected(it)}
                onBook={(service) => {
                  window.location.href = `/store/${vendor.slug}/book/${service.id}`;
                }}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-display font-medium">{vendor.name}</div>
            <div className="text-xs text-ink-muted mt-1">Powered by Vyapar360</div>
          </div>
          <Logo size="sm" />
        </div>
      </footer>

      {/* Product/service modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <ItemDetail
            item={selected}
            isRestaurant={isRestaurant}
            accentClass={accentClass}
            accentBg={accentBg}
            vendor={vendor}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>

      {/* Cart drawer (restaurant only) */}
      {isRestaurant && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} vendor={vendor} accentBg={accentBg} accentClass={accentClass} />}
    </div>
  );
}

function CatChip({ active, onClick, children, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap ${
        active
          ? "bg-white/10 text-ink-primary border-white/20"
          : "bg-bg-surface text-ink-secondary border-line hover:text-ink-primary hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function ItemCard({ item, isRestaurant, accentClass, onOpen, onBook, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="card-surface card-hover overflow-hidden flex flex-col"
      data-testid={`store-item-${item.id}`}
    >
      <button onClick={onOpen} className="relative aspect-[4/3] w-full bg-bg-elevated overflow-hidden text-left">
        {item.image ? (
          <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-muted">
            <ImagePlus className="h-8 w-8" />
          </div>
        )}
      </button>
      <div className="p-4 flex-1 flex flex-col">
        <button onClick={onOpen} className="text-left">
          <div className="font-display font-medium">{item.name}</div>
          <div className="mt-1 text-xs text-ink-secondary line-clamp-2 min-h-[2.25rem]">{item.description}</div>
        </button>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className={`font-mono text-sm ${accentClass}`}>{formatINR(item.price)}</div>
            {!isRestaurant && (
              <div className="text-[11px] text-ink-muted inline-flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" /> {item.duration}m
              </div>
            )}
          </div>
          {isRestaurant ? (
            <AddButton item={item} />
          ) : (
            <button
              onClick={() => onBook(item)}
              className="btn-primary !py-2 !px-3 text-sm inline-flex items-center gap-1.5"
              data-testid={`book-service-${item.id}`}
            >
              Book <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AddButton({ item }) {
  const { items, add, increment, decrement } = useCart();
  const line = items.find((i) => i.id === item.id);
  if (!line) {
    return (
      <button onClick={() => add(item)} className="btn-primary !py-2 !px-3 text-sm inline-flex items-center gap-1.5" data-testid={`add-item-${item.id}`}>
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-elevated pl-1 pr-1 py-0.5">
      <button onClick={() => decrement(item.id)} className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/5 text-ink-secondary hover:text-ink-primary transition-colors" data-testid={`decrement-${item.id}`}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="text-sm font-mono min-w-[1rem] text-center">{line.qty}</span>
      <button onClick={() => increment(item.id)} className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/5 text-ink-secondary hover:text-ink-primary transition-colors" data-testid={`increment-${item.id}`}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ItemDetail({ item, isRestaurant, accentClass, accentBg, vendor, onClose }) {
  return (
    <div>
      {item.image && (
        <div className="rounded-xl overflow-hidden bg-bg-elevated -mt-2 mb-5 aspect-[16/9]">
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <h2 className="font-display text-2xl font-medium">{item.name}</h2>
      <div className={`mt-1 font-mono ${accentClass}`}>{formatINR(item.price)}{!isRestaurant && ` · ${item.duration}m`}</div>
      {item.description && <p className="mt-4 text-ink-secondary leading-relaxed">{item.description}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">Close</button>
        {isRestaurant ? (
          <DetailAddBtn item={item} onDone={onClose} />
        ) : (
          <Link
            to={`/store/${vendor.slug}/book/${item.id}`}
            className="btn-primary inline-flex items-center gap-2"
            data-testid={`detail-book-${item.id}`}
          >
            Book this service <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function DetailAddBtn({ item, onDone }) {
  const { add } = useCart();
  return (
    <button
      onClick={() => {
        add(item);
        onDone?.();
      }}
      className="btn-primary inline-flex items-center gap-2"
      data-testid={`detail-add-${item.id}`}
    >
      <Plus className="h-4 w-4" /> Add to cart
    </button>
  );
}

function CartTrigger({ onOpen, accentBg }) {
  const { count } = useCart();
  return (
    <button
      onClick={onOpen}
      className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium text-white ${accentBg} transition-transform hover:-translate-y-0.5`}
      data-testid="cart-trigger-btn"
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="min-w-[20px] h-5 rounded-full bg-white text-black text-[11px] font-semibold grid place-items-center px-1.5" data-testid="cart-count">
          {count}
        </span>
      )}
    </button>
  );
}

function CartDrawer({ open, onClose, vendor, accentBg, accentClass }) {
  const { items, increment, decrement, remove, subtotal, tax, total } = useCart();
  const nav = useNavigate();

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-bg-surface border-l border-line flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="cart-drawer"
      >
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-muted">Cart</div>
            <div className="mt-1 font-display text-xl font-medium">Your order</div>
          </div>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/5 text-ink-secondary hover:text-ink-primary transition-colors" data-testid="cart-close-btn">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full grid place-items-center text-center">
              <div>
                <ShoppingBag className="h-8 w-8 text-ink-muted mx-auto" />
                <div className="mt-3 font-display">Your cart is empty</div>
                <p className="mt-1 text-sm text-ink-secondary">Add items from the menu to get started.</p>
              </div>
            </div>
          ) : (
            items.map((line) => (
              <div key={line.id} className="rounded-xl bg-bg-elevated border border-line p-3 flex gap-3">
                <div className="h-14 w-14 rounded-lg bg-bg-surface border border-line overflow-hidden flex-shrink-0 grid place-items-center">
                  {line.image ? <img src={line.image} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-4 w-4 text-ink-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium truncate">{line.name}</div>
                    <button onClick={() => remove(line.id)} className="text-ink-muted hover:text-red-400 transition-colors" aria-label="Remove" data-testid={`cart-remove-${line.id}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className={`text-xs mt-0.5 ${accentClass}`}>{formatINR(line.price)}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-bg-surface">
                      <button onClick={() => decrement(line.id)} className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/5 text-ink-secondary" data-testid={`cart-decrement-${line.id}`}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-mono min-w-[1.25rem] text-center">{line.qty}</span>
                      <button onClick={() => increment(line.id)} className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/5 text-ink-secondary" data-testid={`cart-increment-${line.id}`}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="font-mono text-sm">{formatINR(line.price * line.qty)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line p-5 space-y-3">
            <Row label="Subtotal" value={formatINR(subtotal)} />
            <Row label="Tax (5%)" value={formatINR(tax)} />
            <Row label="Total" value={formatINR(total)} bold />
            <button
              onClick={() => {
                onClose();
                nav(`/store/${vendor.slug}/checkout`);
              }}
              className={`w-full text-white font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2 ${accentBg} transition-transform hover:-translate-y-0.5`}
              data-testid="cart-checkout-btn"
            >
              Checkout <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-ink-primary font-medium" : "text-ink-secondary text-sm"}>{label}</span>
      <span className={`font-mono ${bold ? "text-lg font-semibold" : "text-sm"}`}>{value}</span>
    </div>
  );
}
