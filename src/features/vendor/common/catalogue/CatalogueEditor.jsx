import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, ImagePlus, Folder, X, Upload, Link as LinkIcon } from "lucide-react";
import { useAuth } from "../../../../lib/auth";
import { formatINR, uid } from "../../../../lib/utils";
import * as repository from "@/data/storefrontRepository";
import Modal from "@/shared/components/feedback/Modal";

export default function CatalogueEditor({ kind }) {
  const { PRODUCT_STATES, getProductStateMeta, normalizeProductState } = repository;
  const { vendor, updateVendor } = useAuth();
  const isRestaurant = kind === "restaurant";
  const list = isRestaurant ? vendor.items : vendor.services;
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [editing, setEditing] = useState(null); // item/service being edited
  const [openItem, setOpenItem] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const filtered = useMemo(() => {
    return list.filter(
      (it) =>
        (activeCat === "all" || it.categoryId === activeCat) &&
        (q.trim() === "" || it.name.toLowerCase().includes(q.toLowerCase()))
    );
  }, [list, q, activeCat]);

  const openNew = () => {
    setEditing({
      id: null,
      name: "",
      description: "",
      price: "",
      duration: 30,
      categoryId: vendor.categories[0]?.id || "",
      image: "",
      images: [],
      state: "available",
      available: true,
    });
    setOpenItem(true);
  };
  const openEdit = (it) => {
    setEditing({
      ...it,
      images: it.images || (it.image ? [it.image] : []),
      state: it.state || (it.available === false ? "not_available" : "available"),
    });
    setOpenItem(true);
  };

  const saveItem = () => {
    if (!editing.name.trim()) return toast.error("Name is required");
    if (!editing.categoryId) return toast.error("Select a category");
    const price = Number(editing.price);
    if (!price || price < 0) return toast.error("Enter a valid price");

    const images = (editing.images || []).filter(Boolean);
    const primaryImage = images[0] || editing.image?.trim() || "";
    const state = editing.state || "available";
    const cleaned = {
      id: editing.id || uid(isRestaurant ? "itm" : "svc"),
      name: editing.name.trim(),
      description: editing.description.trim(),
      price,
      categoryId: editing.categoryId,
      image: primaryImage, // legacy field kept for back-compat
      images,
      state,
      available: state === "available", // back-compat flag
      ...(isRestaurant ? {} : { duration: Number(editing.duration) || 30 }),
    };
    const key = isRestaurant ? "items" : "services";
    const next = [...vendor[key]];
    const idx = next.findIndex((x) => x.id === cleaned.id);
    if (idx >= 0) next[idx] = cleaned;
    else next.push(cleaned);
    updateVendor({ [key]: next });
    toast.success(idx >= 0 ? "Updated" : "Added");
    setOpenItem(false);
    setEditing(null);
  };

  const deleteItem = (id) => {
    if (!window.confirm("Delete this item?")) return;
    const key = isRestaurant ? "items" : "services";
    updateVendor({ [key]: vendor[key].filter((x) => x.id !== id) });
    toast.success("Deleted");
  };

  const toggleAvailable = (it) => {
    const key = isRestaurant ? "items" : "services";
    updateVendor({ [key]: vendor[key].map((x) => (x.id === it.id ? { ...x, available: !x.available } : x)) });
  };

  const saveCategory = (name, id = null) => {
    const n = name.trim();
    if (!n) return toast.error("Category name is required");
    let cats;
    if (id) cats = vendor.categories.map((c) => (c.id === id ? { ...c, name: n } : c));
    else cats = [...vendor.categories, { id: uid("cat"), name: n }];
    updateVendor({ categories: cats });
    toast.success(id ? "Category updated" : "Category added");
    setOpenCat(false);
    setEditingCat(null);
  };

  const deleteCategory = (id) => {
    const inUse = list.some((x) => x.categoryId === id);
    if (inUse) return toast.error("Category has items. Move or delete them first.");
    if (!window.confirm("Delete this category?")) return;
    updateVendor({ categories: vendor.categories.filter((c) => c.id !== id) });
    if (activeCat === id) setActiveCat("all");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Catalogue</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="catalogue-title">
            {isRestaurant ? "Menu" : "Services"}
          </h1>
          <p className="mt-1 text-ink-secondary">Manage what customers can order or book.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingCat({ id: null, name: "" });
              setOpenCat(true);
            }}
            className="btn-ghost inline-flex items-center gap-2"
            data-testid="add-category-btn"
          >
            <Folder className="h-4 w-4" /> New category
          </button>
          <button onClick={openNew} className="btn-primary inline-flex items-center gap-2" data-testid="add-item-btn">
            <Plus className="h-4 w-4" /> {isRestaurant ? "Add item" : "Add service"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="input-field pl-10"
            data-testid="catalogue-search"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")} testid="cat-chip-all">All</CatChip>
          {vendor.categories.map((c) => (
            <CatChip
              key={c.id}
              active={activeCat === c.id}
              onClick={() => setActiveCat(c.id)}
              onEdit={() => {
                setEditingCat({ id: c.id, name: c.name });
                setOpenCat(true);
              }}
              onDelete={() => deleteCategory(c.id)}
              testid={`cat-chip-${c.id}`}
            >
              {c.name}
            </CatChip>
          ))}
        </div>
      </div>

      {/* Items table/list */}
      {filtered.length === 0 ? (
        <div className="card-surface p-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-brand-soft border border-brand/30 grid place-items-center">
            <Plus className="h-5 w-5 text-brand" />
          </div>
          <h3 className="mt-4 font-display text-lg">
            {q ? "No matches" : `No ${isRestaurant ? "items" : "services"} yet`}
          </h3>
          <p className="mt-1 text-ink-secondary text-sm">
            {q ? "Try a different search term." : `Add your first ${isRestaurant ? "menu item" : "service"} to start selling.`}
          </p>
          {!q && (
            <button onClick={openNew} className="btn-primary mt-6 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> {isRestaurant ? "Add item" : "Add service"}
            </button>
          )}
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-ink-muted border-b border-line">
            <div className="col-span-5">Item</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <ul className="divide-y divide-line">
            {filtered.map((it) => {
              const cat = vendor.categories.find((c) => c.id === it.categoryId);
              return (
                <li key={it.id} className="px-4 sm:px-5 py-4 grid md:grid-cols-12 gap-3 items-center hover:bg-white/[0.02] transition-colors" data-testid={`catalogue-row-${it.id}`}>
                  <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                    <div className="h-14 w-14 rounded-lg bg-bg-elevated border border-line overflow-hidden flex-shrink-0 grid place-items-center">
                      {it.image ? (
                        <img src={it.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-ink-muted" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate flex items-center gap-2">
                        {it.name}
                        {(() => {
                          const s = normalizeProductState(it);
                          if (s === "available") return null;
                          const meta = getProductStateMeta(s);
                          const tone =
                            s === "out_of_stock" ? "!text-amber-300 !border-amber-500/40 !bg-amber-500/10" :
                            s === "coming_soon"  ? "!text-brand !border-brand/40 !bg-brand-soft" :
                            "!text-red-300 !border-red-500/40 !bg-red-500/10";
                          return <span className={`tag !text-[10px] !py-0.5 ${tone}`} data-testid={`item-state-badge-${it.id}`}>{meta.label}</span>;
                        })()}
                      </div>
                      <div className="text-xs text-ink-muted truncate">{it.description}</div>
                    </div>
                  </div>
                  <div className="md:col-span-3 text-sm text-ink-secondary">{cat?.name}</div>
                  <div className="md:col-span-2 font-mono text-sm">
                    {formatINR(it.price)}
                    {!isRestaurant && <span className="text-ink-muted text-xs"> · {it.duration}m</span>}
                  </div>
                  <div className="md:col-span-2 flex items-center gap-1 justify-end">
                    <button
                      onClick={() => toggleAvailable(it)}
                      className="text-xs px-2.5 py-1.5 rounded-md text-ink-secondary hover:bg-white/5 hover:text-ink-primary transition-colors"
                      data-testid={`toggle-available-${it.id}`}
                    >
                      {it.available ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => openEdit(it)}
                      className="h-8 w-8 grid place-items-center rounded-md text-ink-secondary hover:bg-white/5 hover:text-ink-primary transition-colors"
                      aria-label="Edit"
                      data-testid={`edit-item-${it.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(it.id)}
                      className="h-8 w-8 grid place-items-center rounded-md text-ink-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      aria-label="Delete"
                      data-testid={`delete-item-${it.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Item modal */}
      <Modal open={openItem} onClose={() => setOpenItem(false)}>
        <h2 className="font-display text-xl font-medium mb-1">
          {editing?.id ? `Edit ${isRestaurant ? "item" : "service"}` : `New ${isRestaurant ? "item" : "service"}`}
        </h2>
        <p className="text-sm text-ink-secondary mb-5">Customers will see this on your storefront.</p>
        {editing && (
          <div className="space-y-4">
            <FormRow label="Name" required>
              <input className="input-field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="item-name-input" />
            </FormRow>
            <FormRow label="Description">
              <textarea className="input-field min-h-[80px] resize-y" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} data-testid="item-description-input" />
            </FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormRow label="Price (₹)" required>
                <input type="number" min="0" className="input-field" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} data-testid="item-price-input" />
              </FormRow>
              {!isRestaurant && (
                <FormRow label="Duration (min)">
                  <input type="number" min="5" step="5" className="input-field" value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} data-testid="item-duration-input" />
                </FormRow>
              )}
              <FormRow label="Category" required className={isRestaurant ? "" : ""}>
                <select className="input-field" value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })} data-testid="item-category-select">
                  {vendor.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FormRow>
              {isRestaurant && <div />}
            </div>
            <FormRow label="Images">
              <ImageEditor
                images={editing.images || []}
                onChange={(images) => setEditing({ ...editing, images })}
              />
            </FormRow>
            <FormRow label="Availability state">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRODUCT_STATES.map((s) => {
                  const on = (editing.state || "available") === s.id;
                  const tint =
                    s.id === "available" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" :
                    s.id === "out_of_stock" ? "border-amber-500/40 bg-amber-500/10 text-amber-300" :
                    s.id === "coming_soon" ? "border-brand/40 bg-brand-soft text-brand" :
                    "border-red-500/40 bg-red-500/10 text-red-300";
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEditing({ ...editing, state: s.id })}
                      data-testid={`item-state-${s.id}`}
                      className={`text-xs px-2 py-2 rounded-lg border transition-colors ${
                        on ? tint : "bg-bg-elevated border-line text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </FormRow>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpenItem(false)} className="btn-ghost">Cancel</button>
              <button onClick={saveItem} className="btn-primary" data-testid="save-item-btn">
                {editing?.id ? "Save changes" : "Add"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Category modal */}
      <Modal open={openCat} onClose={() => setOpenCat(false)}>
        <h2 className="font-display text-xl font-medium mb-1">{editingCat?.id ? "Rename category" : "New category"}</h2>
        <p className="text-sm text-ink-secondary mb-5">Group your {isRestaurant ? "menu items" : "services"} for easy browsing.</p>
        {editingCat && (
          <div className="space-y-4">
            <FormRow label="Category name" required>
              <input
                className="input-field"
                value={editingCat.name}
                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                data-testid="category-name-input"
                autoFocus
              />
            </FormRow>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpenCat(false)} className="btn-ghost">Cancel</button>
              <button onClick={() => saveCategory(editingCat.name, editingCat.id)} className="btn-primary" data-testid="save-category-btn">
                {editingCat?.id ? "Save" : "Add"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CatChip({ active, onClick, onEdit, onDelete, children, testid }) {
  return (
    <div className="group relative flex-shrink-0">
      <button
        onClick={onClick}
        data-testid={testid}
        className={`px-3.5 py-2 rounded-full text-sm border transition-colors whitespace-nowrap ${
          active
            ? "bg-brand-soft text-ink-primary border-brand/40"
            : "bg-bg-surface text-ink-secondary border-line hover:text-ink-primary hover:border-white/20"
        }`}
      >
        {children}
      </button>
      {onEdit && (
        <div className="hidden group-hover:flex absolute -top-2 -right-2 gap-1">
          <button onClick={onEdit} className="h-5 w-5 rounded-full bg-bg-elevated border border-line grid place-items-center text-ink-secondary hover:text-ink-primary" aria-label="Edit category">
            <Edit2 className="h-2.5 w-2.5" />
          </button>
          <button onClick={onDelete} className="h-5 w-5 rounded-full bg-bg-elevated border border-line grid place-items-center text-ink-secondary hover:text-red-400" aria-label="Delete category">
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function FormRow({ label, required, className = "", children }) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">
        {label}
        {required && <span className="text-restaurant ml-1">*</span>}
      </div>
      {children}
    </div>
  );
}

/**
 * ImageEditor — thumbnail row + "upload from device" (base64) or "paste URL"
 * modes. First image is the primary/cover for legacy consumers.
 */
function ImageEditor({ images, onChange }) {
  const [mode, setMode] = useState("url"); // url | upload
  const [url, setUrl] = useState("");
  const fileRef = useRef(null);

  const add = (src) => onChange([...(images || []), src]);
  const remove = (i) => onChange(images.filter((_, idx) => idx !== i));
  const promote = (i) => {
    const next = [...images];
    const [x] = next.splice(i, 1);
    next.unshift(x);
    onChange(next);
  };

  const onFile = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    let remaining = files.length;
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onChange((prev) => Array.isArray(prev) ? [...prev, ev.target.result] : [ev.target.result]);
        remaining -= 1;
      };
      reader.readAsDataURL(f);
    });
  };

  const submitUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    add(trimmed);
    setUrl("");
  };

  return (
    <div className="space-y-3" data-testid="item-image-editor">
      {images.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((src, i) => (
            <li key={i} className="relative rounded-lg overflow-hidden border border-line group aspect-square bg-bg-elevated" data-testid={`item-image-${i}`}>
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 tag !text-[9px] !py-0 !px-1.5 !text-emerald-300 !border-emerald-500/40 !bg-emerald-500/10">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center gap-1 flex-col">
                {i !== 0 && (
                  <button type="button" onClick={() => promote(i)} className="text-[10px] text-white bg-brand rounded px-1.5 py-0.5">Make cover</button>
                )}
                <button type="button" onClick={() => remove(i)} aria-label="Remove" className="text-white h-6 w-6 grid place-items-center rounded-full bg-red-500/80 hover:bg-red-500">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-1 border border-line rounded-lg bg-bg-elevated p-1 w-fit">
        <button type="button" onClick={() => setMode("url")} data-testid="item-image-mode-url" className={`text-xs px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${mode === "url" ? "bg-white text-bg-base font-medium" : "text-ink-secondary"}`}>
          <LinkIcon className="h-3 w-3" /> URL
        </button>
        <button type="button" onClick={() => setMode("upload")} data-testid="item-image-mode-upload" className={`text-xs px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${mode === "upload" ? "bg-white text-bg-base font-medium" : "text-ink-secondary"}`}>
          <Upload className="h-3 w-3" /> Upload
        </button>
      </div>

      {mode === "url" ? (
        <div className="flex gap-2">
          <input
            className="input-field !py-2 flex-1"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            data-testid="item-image-url-input"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitUrl(); } }}
          />
          <button type="button" onClick={submitUrl} className="btn-ghost text-xs" data-testid="item-image-url-add">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full py-4 rounded-lg border-2 border-dashed border-line hover:border-brand/40 text-ink-secondary text-xs inline-flex items-center justify-center gap-2 transition-colors"
          data-testid="item-image-upload-btn"
        >
          <ImagePlus className="h-4 w-4" /> Click to pick images from your device
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFile} hidden />
    </div>
  );
}
