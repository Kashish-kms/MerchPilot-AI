'use client';
import { useState } from 'react';
import { AlertCircle, CheckCircle, FileJson, Upload } from 'lucide-react';

type Row = { sku: string; name: string; price: number | null; inventory: number };
export default function ScrubberPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState(0);
  const [busy, setBusy] = useState(false);
  async function scrub() {
    if (!file) return;
    setBusy(true);
    const lines = (await file.text()).split(/\r?\n/).slice(1).filter(Boolean);
    const input = lines.map(line => { const [sku, name, price, inventory] = line.split(','); return { sku: sku?.trim() ?? '', name: name?.trim() ?? '', price: price ? Number(price) : null, inventory: Number(inventory) || 0 }; });
    const response = await fetch('http://localhost:4000/api/scrub', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
    const data = await response.json();
    setRows(data.rows); setWarnings(data.warnings); setDuplicates(data.duplicatesRemoved); setBusy(false);
  }
  return <main className="min-h-screen p-6 sm:p-10"><div className="mx-auto max-w-6xl"><h1 className="text-3xl font-bold">Automated Data Scrubber</h1><p className="mt-2 text-slate-500">Clean and validate inventory before AI analysis.</p><div className="card mt-8 p-8 text-center"><FileJson className="mx-auto text-brand" size={34}/><h2 className="mt-4 font-bold">Import inventory CSV</h2><p className="mt-1 text-sm text-slate-500">SKU, Name, Price, Inventory</p><label className="mx-auto mt-6 block max-w-md cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 p-10 hover:border-brand"><Upload className="mx-auto"/><p className="mt-2 text-sm">{file?.name ?? 'Choose a CSV file'}</p><input className="hidden" type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] ?? null)}/></label><button onClick={scrub} disabled={!file || busy} className="mt-6 rounded-xl bg-brand px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Cleaning...' : 'Start scrubbing'}</button></div>{(rows.length > 0 || warnings.length > 0) && <section className="mt-8"><div className="mb-4 grid gap-4 sm:grid-cols-3"><div className="card p-5"><p className="text-xs text-slate-500">Clean rows</p><b className="text-3xl">{rows.length}</b></div><div className="card p-5"><p className="text-xs text-slate-500">Duplicates removed</p><b className="text-3xl">{duplicates}</b></div><div className="card p-5"><p className="text-xs text-slate-500">Warnings</p><b className="text-3xl">{warnings.length}</b></div></div>{warnings.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><AlertCircle className="mr-2 inline" size={16}/>{warnings.join(' · ')}</div>}<div className="card mt-5 overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-4">SKU</th><th className="p-4">Name</th><th className="p-4">Price</th><th className="p-4">Inventory</th><th className="p-4">Status</th></tr></thead><tbody>{rows.slice(0, 20).map(row => <tr className="border-b" key={row.sku}><td className="p-4 font-mono">{row.sku}</td><td className="p-4">{row.name}</td><td className="p-4">{row.price == null ? 'Missing' : `$${row.price.toFixed(2)}`}</td><td className="p-4">{row.inventory}</td><td className="p-4 text-emerald-600"><CheckCircle className="mr-1 inline" size={15}/>Validated</td></tr>)}</tbody></table></div></section>}</div></main>;
}
