import { FormEvent, useEffect, useState } from "react";
import { createStaff, getStaff, StaffMember } from "../../services/adminService";
import Button from "../../components/ui/Button";

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [role, setRole] = useState<"storekeeper" | "delivery_officer">("storekeeper");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdLoginUrl, setCreatedLoginUrl] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", employeeId: "", jobTitle: "", startDate: "", salary: "", motorcyclePlate: "" });
  useEffect(() => { getStaff().then(setStaff).catch((e) => setError(e.message)); }, []);
  const change = (key: keyof typeof form, value: string) => setForm((old) => ({ ...old, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError(""); setCreatedLoginUrl("");
    try {
      const created = await createStaff({ name: form.name, email: form.email, password: form.password, phone: form.phone, role, employment: { employeeId: form.employeeId, jobTitle: form.jobTitle || role.replace("_", " "), startDate: form.startDate || undefined, salary: form.salary ? Number(form.salary) : undefined, motorcyclePlate: form.motorcyclePlate || undefined } });
      setStaff((current) => [created, ...current]);
      setCreatedLoginUrl(`${window.location.origin}${created.loginPath}`);
      setForm({ name: "", email: "", password: "", phone: "", employeeId: "", jobTitle: "", startDate: "", salary: "", motorcyclePlate: "" });
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const input = "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm";
  return <div><h1 className="text-xl font-bold text-gray-800">Staff and employment</h1><p className="mb-5 mt-1 text-sm text-gray-500">Create storekeeper and delivery officer accounts with their employment details.</p>
    <form onSubmit={submit} className="mb-6 grid gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-card sm:grid-cols-2">
      <label className="text-sm text-gray-600">Staff role<select className={input} value={role} onChange={(e) => setRole(e.target.value as typeof role)}><option value="storekeeper">Storekeeper</option><option value="delivery_officer">Delivery officer</option></select></label>
      <label className="text-sm text-gray-600">Official full name<input required className={input} value={form.name} onChange={(e) => change("name", e.target.value)} /></label>
      <label className="text-sm text-gray-600">Email<input required type="email" className={input} value={form.email} onChange={(e) => change("email", e.target.value)} /></label>
      <label className="text-sm text-gray-600">Temporary password<input required minLength={6} type="password" className={input} value={form.password} onChange={(e) => change("password", e.target.value)} /></label>
      <label className="text-sm text-gray-600">Official contact number<input required type="tel" className={input} value={form.phone} onChange={(e) => change("phone", e.target.value)} /></label>
      <label className="text-sm text-gray-600">Employee ID<input className={input} value={form.employeeId} onChange={(e) => change("employeeId", e.target.value)} /></label>
      <label className="text-sm text-gray-600">Job title<input className={input} value={form.jobTitle} onChange={(e) => change("jobTitle", e.target.value)} placeholder={role === "storekeeper" ? "Storekeeper" : "Delivery officer"} /></label>
      <label className="text-sm text-gray-600">Employment start date<input type="date" className={input} value={form.startDate} onChange={(e) => change("startDate", e.target.value)} /></label>
      <label className="text-sm text-gray-600">Monthly salary (KES)<input type="number" min="0" className={input} value={form.salary} onChange={(e) => change("salary", e.target.value)} /></label>
      {role === "delivery_officer" && <label className="text-sm text-gray-600">Motorcycle plate number<input required className={input} value={form.motorcyclePlate} onChange={(e) => change("motorcyclePlate", e.target.value)} placeholder="KMDX 123A" /></label>}
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}{createdLoginUrl && <p className="sm:col-span-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">Account created. Share this {role === "storekeeper" ? "storekeeper" : "delivery officer"} login link: <a className="font-semibold underline" href={createdLoginUrl}>{createdLoginUrl}</a></p>}<div><Button disabled={busy}>{busy ? "Creating account..." : "Add staff account"}</Button></div>
    </form>
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card"><div className="border-b p-4 font-semibold">Current staff ({staff.length})</div>{staff.length === 0 ? <p className="p-5 text-sm text-gray-500">No staff accounts yet.</p> : staff.map((member) => <div key={member._id} className="grid gap-1 border-b p-4 last:border-0 sm:grid-cols-4"><div className="font-semibold text-gray-800">{member.name}<p className="text-xs font-normal text-gray-500">{member.employment?.employeeId || "No employee ID"}</p></div><div className="text-sm text-gray-600">{member.role === "storekeeper" ? "Storekeeper" : "Delivery officer"}<p className="text-xs">{member.employment?.jobTitle || ""}</p></div><div className="text-sm text-gray-600">{member.phone}<p className="text-xs">{member.email}</p></div><div className="text-sm text-gray-600">{member.role === "delivery_officer" ? `Motorcycle: ${member.employment?.motorcyclePlate || "—"}` : member.employment?.startDate ? `Since ${new Date(member.employment.startDate).toLocaleDateString()}` : ""}<p className="mt-1"><a className="text-xs font-semibold text-brand-700 underline" href={`${window.location.origin}${member.loginPath}`}>Role login link</a></p></div></div>)}</div>
  </div>;
}
