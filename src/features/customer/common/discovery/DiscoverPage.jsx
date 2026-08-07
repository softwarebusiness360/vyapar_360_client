import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Utensils, Scissors, MapPin, ArrowRight, Store } from "lucide-react";
import PublicHeader from "@/shared/components/navigation/PublicHeader";
import PublicFooter from "@/shared/components/layout/PublicFooter";
import { Container } from "@/shared/components/layout/Container";
import * as repository from "@/data/storefrontRepository";

export default function DiscoverPage() {
  const { getVendors, seedIfNeeded } = repository;
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    seedIfNeeded();
    setVendors(getVendors().filter((v) => v.onboarded));
  }, []);

  const filtered = useMemo(() => {
    return vendors.filter(
      (v) =>
        (type === "all" || v.businessType === type) &&
        (q.trim() === "" || v.name.toLowerCase().includes(q.toLowerCase()) || v.tagline?.toLowerCase().includes(q.toLowerCase()))
    );
  }, [vendors, q, type]);

  return (
    <div className="min-h-screen">
      <PublicHeader />

      <Container className="pt-12 pb-8">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-brand">Discover</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-display font-medium tracking-tighter" data-testid="discover-title">
            Local storefronts, curated.
          </h1>
          <p className="mt-4 text-ink-secondary">
            Browse every business built on Vyapar360. Order food, book a service, and
            support neighbourhood brands.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stores…"
              className="input-field pl-10"
              data-testid="discover-search"
            />
          </div>
          <div className="flex gap-2">
            <TypeChip active={type === "all"} onClick={() => setType("all")} testid="filter-all">All</TypeChip>
            <TypeChip active={type === "restaurant"} onClick={() => setType("restaurant")} icon={Utensils} testid="filter-restaurant">Restaurants</TypeChip>
            <TypeChip active={type === "salon"} onClick={() => setType("salon")} icon={Scissors} testid="filter-salon">Salons</TypeChip>
          </div>
        </div>
      </Container>

      <Container className="pb-24">
        {filtered.length === 0 ? (
          <div className="card-surface p-16 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-soft border border-brand/30 grid place-items-center">
              <Store className="h-5 w-5 text-brand" />
            </div>
            <h3 className="mt-4 font-display text-lg">No stores match</h3>
            <p className="mt-1 text-ink-secondary text-sm">Try a different search term or category.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link
                  to={`/store/${v.slug}`}
                  className="group card-surface card-hover overflow-hidden block h-full"
                  data-testid={`discover-store-${v.slug}`}
                >
                  <div className="relative h-40 bg-bg-elevated overflow-hidden">
                    {v.coverImage ? (
                      <img
                        src={v.coverImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-ink-muted">
                        <Store className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-surface/95 via-bg-surface/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <TypeBadge type={v.businessType} />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-lg bg-bg-elevated border border-line overflow-hidden grid place-items-center flex-shrink-0">
                        {v.logo ? <img src={v.logo} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4 text-ink-muted" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-medium text-lg truncate">{v.name}</div>
                        <div className="text-xs text-ink-secondary truncate">{v.tagline}</div>
                      </div>
                    </div>
                    {v.address && (
                      <div className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
                        <MapPin className="h-3 w-3" /> <span className="truncate">{v.address}</span>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-line">
                      <span className="text-sm text-ink-secondary">
                        {v.businessType === "restaurant"
                          ? `${v.items.length} item${v.items.length === 1 ? "" : "s"}`
                          : `${v.services.length} service${v.services.length === 1 ? "" : "s"}`}
                      </span>
                      <span className="text-sm text-brand inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Visit <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Container>

      <PublicFooter />
    </div>
  );
}

function TypeChip({ active, onClick, icon: Icon, children, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`px-4 py-2.5 rounded-full text-sm border inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
        active
          ? "bg-brand-soft text-ink-primary border-brand/40"
          : "bg-bg-surface text-ink-secondary border-line hover:text-ink-primary hover:border-white/20"
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}
function TypeBadge({ type }) {
  const map = {
    restaurant: { icon: Utensils, label: "Restaurant", cls: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
    salon: { icon: Scissors, label: "Salon", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  };
  const it = map[type] || map.restaurant;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border backdrop-blur-sm ${it.cls}`}>
      <it.icon className="h-3 w-3" /> {it.label}
    </span>
  );
}
