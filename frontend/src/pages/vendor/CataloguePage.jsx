import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, ImagePlus, Folder } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { formatINR, uid } from "../../lib/utils";
import Modal from "../../components/Modal";

export default function CataloguePage() {
  const { vendor, updateVendor } = useAuth();
  const isRestaurant = vendor.businessType === "restaurant";
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
      available: true,
    });
    setOpenItem(true);
  };
  const openEdit = (it) => {
    setEditing({ ...it });
    setOpenItem(true);
  };

  const saveItem = () => {
    if (!editing.name.trim()) return toast.error("Name is required");
    if (!editing.categoryId) return toast.error("Select a category");
    const price = Number(editing.price);
    if (!price || price < 0) return toast.error("Enter a valid price");

    const cleaned = {
      id: editing.id || uid(isRestaurant ? "itm" : "svc"),
      name: editing.name.trim(),
      description: editing.description.trim(),
      price,
      categoryId: editing.categoryId,
      image: editing.image.trim(),
      available: editing.available,
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
                        {!it.available && <span className="tag !text-[10px] !py-0.5">Hidden</span>}
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
            <FormRow label="Image URL">
              <input className="input-field" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." data-testid="item-image-input" />
            </FormRow>
            <label className="flex items-center gap-2 text-sm text-ink-secondary">
              <input type="checkbox" checked={editing.available} onChange={(e) => setEditing({ ...editing, available: e.target.checked })} data-testid="item-available-checkbox" />
              Available for customers
            </label>
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
