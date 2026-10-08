import { FormEvent, useEffect, useState } from "react";
import { Category } from "../../types";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/categoryService";
import { uploadProductImage } from "../../services/productService";
import { resolveMediaUrl } from "../../utils/media";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = () => { setLoading(true); getCategories().then(setCategories).catch((e) => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(load, []);
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const image = newImage ? await uploadProductImage(newImage) : "";
      const created = await createCategory({ name, image, icon: "" });
      setCategories((prev) => [...prev, created]); setName(""); setNewImage(null);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };
  const saveName = async (category: Category) => {
    try { const updated = await updateCategory(category._id, { name: editName }); setCategories((prev) => prev.map((item) => item._id === category._id ? updated : item)); setEditingId(null); }
    catch (err) { setError((err as Error).message); }
  };
  const changeImage = async (category: Category, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Choose an image no larger than 5 MB."); return; }
    try { setError(""); const image = await uploadProductImage(file); const updated = await updateCategory(category._id, { image }); setCategories((prev) => prev.map((item) => item._id === category._id ? updated : item)); }
    catch (err) { setError((err as Error).message); }
  };
  const handleDelete = async () => {
    if (!toDelete) return;
    try { await deleteCategory(toDelete._id); setCategories((prev) => prev.filter((item) => item._id !== toDelete._id)); }
    catch (err) { setError((err as Error).message); } finally { setToDelete(null); }
  };
  const input = "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm";

  return <div><h1 className="mb-1 text-xl font-bold text-gray-800">Categories</h1><p className="mb-6 text-sm text-gray-500">Organise products and upload a photo for each category tile.</p>
    <form onSubmit={handleAdd} className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-card"><label className="min-w-[180px] flex-1 text-sm text-gray-600">New category name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Frozen Foods" className={input} /></label><label className="text-sm text-gray-600">Category photo (optional)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setNewImage(e.target.files?.[0] || null)} className="mt-1 block max-w-56 text-xs" /></label><Button type="submit" disabled={busy}>{busy ? "Uploading..." : "Add category"}</Button></form>
    {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
    {loading ? <div className="flex justify-center py-16"><Spinner size={32} /></div> : <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white shadow-card">{categories.map((cat) => <div key={cat._id} className="flex flex-wrap items-center gap-4 p-4">
      {cat.image ? <img src={resolveMediaUrl(cat.image)} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-2xl">{cat.icon}</span>}
      {editingId === cat._id ? <><input value={editName} onChange={(e) => setEditName(e.target.value)} className="min-w-40 flex-1 rounded-lg border px-3 py-2 text-sm" /><button onClick={() => saveName(cat)} className="text-sm font-semibold text-brand-700">Save</button><button onClick={() => setEditingId(null)} className="text-sm font-semibold text-gray-500">Cancel</button></> : <span className="flex-1 font-medium text-gray-800">{cat.name}</span>}
      <label className="cursor-pointer text-sm font-semibold text-brand-700 hover:underline">Upload photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => changeImage(cat, e.target.files?.[0])} className="hidden" /></label>
      {!editingId && <button onClick={() => { setEditingId(cat._id); setEditName(cat.name); }} className="text-sm font-semibold text-brand-700 hover:underline">Edit</button>}
      <button onClick={() => setToDelete(cat)} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
    </div>)}</div>}
    {toDelete && <ConfirmDialog title="Delete this category?" message={`"${toDelete.name}" will be removed. You can only delete categories that have no products in them.`} confirmLabel="Yes, delete" onConfirm={handleDelete} onCancel={() => setToDelete(null)} />}
  </div>;
}
