import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Sparkles, ImagePlus, Loader2, Save, X, ArrowRight, Wand2, Store } from "lucide-react";
import { saveVendor, updateVendorPlan } from "../../lib/store";

const uid = (p) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/**
 * AdminOnboardPage — a UI-first "upload a catalogue image, we'll parse it"
 * flow. Backed today by a mocked AI response (2s loader → sample items).
 * The real vision model integration lands later — the UI is production-ready.
 */

const MOCK_MENU = [
  { name: "Margherita Pizza",     price: 349, description: "Classic tomato + mozzarella",              category: "Pizzas" },
  { name: "Farmhouse Pizza",      price: 449, description: "Onion, capsicum, tomato, mushroom",        category: "Pizzas" },
  { name: "Peri Peri Fries",      price: 149, description: "Crisp fries dusted with peri-peri masala", category: "Sides" },
  { name: "Choco Lava Cake",      price: 129, description: "Warm chocolate cake with molten centre",   category: "Desserts" },
  { name: "Fresh Lime Soda",      price:  79, description: "Sweet, salted, or mixed",                  category: "Drinks" },
];
const MOCK_SERVICES = [
  { name: "Haircut & Style",      price: 499, description: "45-minute cut + blow-dry",       category: "Hair",   duration: 45 },
  { name: "Head Massage",         price: 399, description: "30-minute relaxing head massage", category: "Wellness", duration: 30 },
  { name: "Deluxe Manicure",      price: 599, description: "Nail shaping, cuticle care, gel", category: "Nails",  duration: 45 },
];

export default function AdminOnboardPage() {
  const [step, setStep] = useState("intake"); // intake | parsing | review | done
  const [businessType, setBusinessType] = useState("restaurant");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [parsedItems, setParsedItems] = useState([]);
  const fileRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const runParse = () => {
    if (!businessName.trim()) return toast.error("Business name required");
    if (!ownerName.trim()) return toast.error("Owner name required");
    if (!email.trim()) return toast.error("Owner email required");
    setStep("parsing");
    // MOCKED: simulate a vision model returning structured menu / service data
    setTimeout(() => {
      setParsedItems((businessType === "salon" ? MOCK_SERVICES : MOCK_MENU).map((it) => ({ id: uid("item"), ...it, state: "available", images: [] })));
      setStep("review");
    }, 1600);
  };

  const updateItem = (i, patch) => setParsedItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (i) => setParsedItems((prev) => prev.filter((_, idx) => idx !== i));
  const addItem = () => setParsedItems((prev) => [...prev, { id: uid("item"), name: "New item", price: 0, description: "", category: "Uncategorised", state: "available", images: [] }]);

  const commit = () => {
    if (parsedItems.length === 0) return toast.error("Add at least one item before saving.");
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();
    const vendorId = uid("v");
    const storefrontId = uid("sf");
    const isRestaurant = businessType === "restaurant";
    const categories = Array.from(new Set(parsedItems.map((it) => it.category))).map((name) => ({ id: uid("cat"), name }));
    const withCats = parsedItems.map((it) => ({ ...it, categoryId: categories.find((c) => c.name === it.category)?.id }));

    const vendor = {
      id: vendorId,
      email: email.trim(),
      password: "welcome1234", // owner logs in with this initially
      name: ownerName.trim(),
      businessName: businessName.trim(),
      businessType,
      phone,
      city,
      slug,
      createdAt: now,
      onboarded: true,
      plan: "growth",
      features: { multiStore: false, employees: true },
      storefronts: [
        {
          id: storefrontId,
          name: businessName.trim(),
          slug,
          city,
          businessType,
          createdAt: now,
          categories,
          items: isRestaurant ? withCats : [],
          services: isRestaurant ? [] : withCats,
        },
      ],
      // legacy top-level (some places still read these)
      categories,
      items: isRestaurant ? withCats : [],
      services: isRestaurant ? [] : withCats,
      employees: [],
    };
    saveVendor(vendor);
    updateVendorPlan(vendorId, "growth");
    toast.success(`${businessName} onboarded — they can sign in with ${email} / welcome1234`);
    setStep("done");
  };

  const reset = () => {
    setStep("intake"); setBusinessName(""); setOwnerName(""); setEmail("");
    setPhone(""); setCity(""); setImagePreview(null); setParsedItems([]);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-muted">Onboarding</div>
        <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="admin-onboard-title">
          Quick vendor onboarding
        </h1>
        <p className="mt-1 text-ink-secondary">
          Snap a photo of the menu or service card — we'll extract, structure, and preview the catalogue.
        </p>
      </div>

      <Steps step={step} />

      {step === "intake" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-surface p-6 space-y-4">
            <div className="text-[11px] uppercase tracking-widest text-ink-muted">Business & owner</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Row label="Business type">
                <select className="input-field !py-2" value={businessType} onChange={(e) => setBusinessType(e.target.value)} data-testid="onboard-business-type">
                  <option value="restaurant">Restaurant</option>
                  <option value="salon">Salon</option>
                </select>
              </Row>
              <Row label="City"><input className="input-field !py-2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" data-testid="onboard-city" /></Row>
              <Row label="Business name" className="sm:col-span-2"><input className="input-field !py-2" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Pizza Palace" data-testid="onboard-business-name" /></Row>
              <Row label="Owner name"><input className="input-field !py-2" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} data-testid="onboard-owner-name" /></Row>
              <Row label="Owner email"><input className="input-field !py-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" data-testid="onboard-owner-email" /></Row>
              <Row label="Phone" className="sm:col-span-2"><input className="input-field !py-2" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="onboard-phone" /></Row>
            </div>
          </div>

          <div className="card-surface p-6 space-y-4">
            <div className="text-[11px] uppercase tracking-widest text-ink-muted">Catalogue image (optional)</div>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-line">
                <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" />
                <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-black/60 border border-white/10 text-white" data-testid="onboard-image-remove">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-52 rounded-xl border-2 border-dashed border-line hover:border-brand/40 bg-bg-elevated/50 flex flex-col items-center justify-center gap-2 text-ink-secondary hover:text-ink-primary transition-colors"
                data-testid="onboard-image-upload"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-sm">Click to upload menu / service list</span>
                <span className="text-[11px] text-ink-muted">PNG or JPG · we'll parse it with AI (mocked for now)</span>
              </button>
            )}
            <input ref={fileRef} onChange={onFile} type="file" accept="image/*" hidden />
            <button
              onClick={runParse}
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
              data-testid="onboard-parse"
            >
              <Wand2 className="h-4 w-4" /> {imagePreview ? "Parse this image" : "Skip image & continue"}
            </button>
          </div>
        </div>
      )}

      {step === "parsing" && (
        <div className="card-surface p-16 text-center" data-testid="onboard-parsing">
          <Loader2 className="h-8 w-8 mx-auto text-brand animate-spin" />
          <div className="mt-4 font-display text-lg">Reading the catalogue…</div>
          <p className="mt-1 text-ink-secondary text-sm">
            Extracting item names, prices, and categories. This usually takes a moment.
          </p>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-brand inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> AI-parsed preview
              </div>
              <div className="mt-1 text-lg font-medium">Review {parsedItems.length} {businessType === "salon" ? "services" : "items"} — edit anything before saving.</div>
            </div>
            <button onClick={addItem} className="btn-ghost inline-flex items-center gap-2 text-sm" data-testid="onboard-add-item">
              <ImagePlus className="h-4 w-4" /> Add item
            </button>
          </div>
          <div className="card-surface overflow-hidden">
            <div className="hidden md:grid grid-cols-12 px-4 py-3 text-[10px] uppercase tracking-widest text-ink-muted border-b border-line">
              <div className="col-span-4">Name</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1 text-right">Rem</div>
            </div>
            <ul className="divide-y divide-line">
              {parsedItems.map((it, i) => (
                <li key={it.id} className="px-4 py-3 grid md:grid-cols-12 gap-2 items-center" data-testid={`onboard-item-${i}`}>
                  <input className="col-span-4 input-field !py-2 text-sm" value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} />
                  <input className="col-span-4 input-field !py-2 text-sm" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
                  <input className="col-span-2 input-field !py-2 text-sm" value={it.category} onChange={(e) => updateItem(i, { category: e.target.value })} />
                  <input type="number" min="0" className="col-span-1 input-field !py-2 text-sm" value={it.price} onChange={(e) => updateItem(i, { price: Number(e.target.value) || 0 })} />
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeItem(i)} className="h-8 w-8 grid place-items-center rounded-md text-ink-muted hover:text-red-400"><X className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setStep("intake")} className="btn-ghost">Back</button>
            <button onClick={commit} className="btn-primary inline-flex items-center gap-2" data-testid="onboard-save">
              <Save className="h-4 w-4" /> Save & onboard vendor
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="card-surface p-12 text-center max-w-lg mx-auto" data-testid="onboard-done">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 grid place-items-center">
            <Store className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="mt-4 font-display text-2xl tracking-tight">{businessName} is live 🎉</div>
          <p className="mt-1 text-ink-secondary text-sm">Login credentials shared with the owner.</p>
          <div className="mt-6 rounded-lg bg-bg-elevated border border-line px-4 py-3 text-sm font-mono text-ink-secondary">
            {email} · welcome1234
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={reset} className="btn-ghost">Onboard another</button>
            <a href={`/store/${businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-*`} className="btn-primary inline-flex items-center gap-2">
              Visit storefront <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Steps({ step }) {
  const stepList = [
    { id: "intake", label: "Intake" },
    { id: "parsing", label: "Parse" },
    { id: "review", label: "Review" },
    { id: "done", label: "Done" },
  ];
  const cur = stepList.findIndex((s) => s.id === step);
  return (
    <ol className="flex items-center gap-2" data-testid="onboard-steps">
      {stepList.map((s, i) => (
        <React.Fragment key={s.id}>
          <li className={`inline-flex items-center gap-2 text-xs ${i <= cur ? "text-ink-primary" : "text-ink-muted"}`}>
            <span className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-mono ${i <= cur ? "bg-brand text-white" : "bg-bg-elevated border border-line"}`}>{i + 1}</span>
            <span>{s.label}</span>
          </li>
          {i < stepList.length - 1 && <span className="h-px w-6 bg-line" />}
        </React.Fragment>
      ))}
    </ol>
  );
}

function Row({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1">{label}</div>
      {children}
    </label>
  );
}
