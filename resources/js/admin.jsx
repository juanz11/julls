import './bootstrap';
import '../css/app.css';

import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp, Upload, LogOut, Users, Package, ShoppingBag, CheckCircle, Clock, XCircle } from 'lucide-react';

const PINK = '#bf7691';
const STORAGE_KEY = 'julls_products';
const CLIENTS_KEY = 'julls_clients';
const ORDERS_KEY = 'julls_orders';
const AUTH_KEY = 'julls_admin_auth';
const MIN_QTY = 12;

const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Choco Crunch', tag: 'BESTSELLER', desc: 'Galleta rellena de chocolate y avellanas.', price: 4.80, image: '/313790.jpg', image2: '/313792.jpg', weight: '150g / 6 unid.', shelf: '90 días', flavors: ['Chocolate Negro', 'Chocolate con Leche'] },
    { id: 2, name: 'Velvet Cream', tag: 'PREMIUM', desc: 'Masa Red Velvet con centro cremoso.', price: 5.50, image: '/313792.jpg', image2: '/313794.jpg', weight: '150g / 6 unid.', shelf: '90 días', flavors: ['Crema Vainilla', 'Crema Fresa'] },
    { id: 3, name: 'Minis Crunch', tag: 'BITE-SIZE', desc: 'Sin relleno. Alta rotación, empaque snack.', price: 1.90, image: '/313794.jpg', image2: '/313790.jpg', weight: 'Stand-up Pouch', shelf: '90 días', flavors: ['Clásica', 'Canela'] },
];

const TAGS = ['BESTSELLER', 'PREMIUM', 'BITE-SIZE', 'NUEVO', 'OFERTA', 'LIMITADO'];

// ── Login ──────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');

    const submit = (e) => {
        e.preventDefault();
        if (user === 'admin' && pass === 'admin') { sessionStorage.setItem(AUTH_KEY, '1'); onLogin(); }
        else setError('Usuario o contraseña incorrectos');
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans" style={{ backgroundColor: '#faf0f1' }}>
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border" style={{ borderColor: '#f0dde3' }}>
                <div className="text-center mb-6">
                    <h1 className="font-black text-2xl text-slate-900">Panel <span style={{ color: PINK }}>JULLS</span></h1>
                    <p className="text-slate-400 text-sm mt-1">Acceso administrativo</p>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Usuario</label>
                        <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="admin" autoFocus
                            className="w-full border rounded-xl px-4 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Contraseña</label>
                        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••"
                            className="w-full border rounded-xl px-4 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    <button type="submit" className="w-full py-3 rounded-full font-bold text-white" style={{ backgroundColor: PINK }}>Entrar</button>
                </form>
            </div>
        </div>
    );
}

// ── Campo genérico ─────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', step, placeholder }) {
    return (
        <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">{label}</label>
            <input type={type} step={step} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
        </div>
    );
}

// ── Gestión de Clientes ────────────────────────────────────────────────────
function ClientsPanel({ clients, setClients }) {
    const [form, setForm] = useState({ name: '', code: '', phone: '', address: '' });
    const [editId, setEditId] = useState(null);

    const save = () => {
        if (!form.name.trim()) return;
        if (editId !== null) {
            setClients(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
            setEditId(null);
        } else {
            setClients(prev => [...prev, { id: Date.now(), ...form }]);
        }
        setForm({ name: '', code: '', phone: '', address: '' });
    };

    const edit = (c) => { setForm({ name: c.name, code: c.code, phone: c.phone, address: c.address }); setEditId(c.id); };
    const remove = (id) => { if (!confirm('¿Eliminar cliente?')) return; setClients(prev => prev.filter(c => c.id !== id)); };
    const cancel = () => { setForm({ name: '', code: '', phone: '', address: '' }); setEditId(null); };

    return (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#f0dde3' }}>
            <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: '#f0dde3', backgroundColor: '#fdf5f7' }}>
                <Users size={18} style={{ color: PINK }} />
                <h2 className="font-black text-slate-800">Clientes registrados</h2>
                <span className="ml-auto text-xs text-slate-400">{clients.length} clientes</span>
            </div>
            <div className="p-5 space-y-4">
                {/* Formulario */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{editId ? 'Editar cliente' : 'Nuevo cliente'}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field label="Nombre / Empresa" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Ej: Farmacia Central" />
                        <Field label="Código / RIF" value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="Ej: J-12345678" />
                        <Field label="Teléfono / WhatsApp" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+58 412 000 0000" />
                        <Field label="Dirección" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="Calle, sector, ciudad" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={save} className="px-5 py-2 rounded-full text-sm font-bold text-white" style={{ backgroundColor: PINK }}>
                            {editId ? 'Actualizar' : 'Agregar cliente'}
                        </button>
                        {editId && <button onClick={cancel} className="px-5 py-2 rounded-full text-sm font-bold border text-slate-500">Cancelar</button>}
                    </div>
                </div>

                {/* Lista */}
                {clients.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-4">No hay clientes registrados.</p>
                ) : (
                    <div className="space-y-2">
                        {clients.map(c => (
                            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: '#f0dde3' }}>
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0" style={{ backgroundColor: PINK }}>
                                    {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">{c.name}</p>
                                    <p className="text-xs text-slate-400">{c.code} {c.phone && `· ${c.phone}`}</p>
                                </div>
                                <button onClick={() => edit(c)} className="text-xs font-bold px-3 py-1 rounded-lg border" style={{ borderColor: PINK, color: PINK }}>Editar</button>
                                <button onClick={() => remove(c.id)} className="text-xs font-bold px-3 py-1 rounded-lg border border-red-200 text-red-400 hover:bg-red-50">Eliminar</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Formulario de producto ─────────────────────────────────────────────────
function ProductForm({ product, onChange, onDelete, index }) {
    const [open, setOpen] = useState(false);
    const [newFlavor, setNewFlavor] = useState('');
    const fileRef = useRef();
    const fileRef2 = useRef();

    const update = (field, value) => onChange(index, { ...product, [field]: value });
    const addFlavor = () => { if (!newFlavor.trim()) return; update('flavors', [...product.flavors, newFlavor.trim()]); setNewFlavor(''); };
    const removeFlavor = (i) => update('flavors', product.flavors.filter((_, fi) => fi !== i));
    const handleImg = (ref, field) => (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => update(field, ev.target.result); r.readAsDataURL(f); };

    return (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#f0dde3' }}>
            <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-pink-50 transition-colors" onClick={() => setOpen(o => !o)}>
                {product.image
                    ? <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                    : <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-slate-100 flex items-center justify-center"><Upload size={16} className="text-slate-300" /></div>}
                <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 truncate">{product.name || 'Sin nombre'}</p>
                    <p className="text-sm font-bold" style={{ color: PINK }}>${Number(product.price).toFixed(2)} · mín. {MIN_QTY} uds.</p>
                </div>
                <span className="text-xs font-bold text-white px-2 py-1 rounded-md mr-2" style={{ backgroundColor: PINK }}>{product.tag}</span>
                {open ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
            </button>

            {open && (
                <div className="p-5 border-t space-y-4" style={{ borderColor: '#f0dde3' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Nombre" value={product.name} onChange={v => update('name', v)} />
                        <div>
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Etiqueta</label>
                            <select value={product.tag} onChange={e => update('tag', e.target.value)}
                                className="w-full border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }}>
                                {TAGS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <Field label="Precio ($)" type="number" step="0.01" value={product.price} onChange={v => update('price', v)} />
                        <Field label="Peso / Presentación" value={product.weight} onChange={v => update('weight', v)} />
                        <Field label="Vida de anaquel" value={product.shelf} onChange={v => update('shelf', v)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Descripción</label>
                        <textarea value={product.desc} onChange={e => update('desc', e.target.value)} rows={2}
                            className="w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none" style={{ borderColor: '#f0dde3' }} />
                    </div>

                    {/* Imágenes */}
                    {[['image', 'Imagen principal', fileRef], ['image2', 'Segunda imagen (hover)', fileRef2]].map(([field, lbl, ref]) => (
                        <div key={field}>
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">{lbl}</label>
                            <div className="flex gap-3 items-start">
                                <div className="w-20 h-20 rounded-xl border overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center" style={{ borderColor: '#f0dde3' }}>
                                    {product[field] ? <img src={product[field]} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> : <Upload size={18} className="text-slate-300" />}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input type="file" accept="image/*" ref={ref} onChange={handleImg(ref, field)} className="hidden" />
                                    <button onClick={() => ref.current.click()}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold hover:bg-pink-50 w-full justify-center"
                                        style={{ borderColor: PINK, color: PINK }}>
                                        <Upload size={14} /> Subir desde PC
                                    </button>
                                    <input type="text" value={product[field] && !product[field].startsWith('data:') ? product[field] : ''}
                                        onChange={e => update(field, e.target.value)} placeholder="O pega una URL..."
                                        className="w-full border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Sabores */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Sabores / Variantes</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {product.flavors.map((f, i) => (
                                <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: PINK }}>
                                    {f} <button onClick={() => removeFlavor(i)} className="ml-1 hover:opacity-70"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={newFlavor} onChange={e => setNewFlavor(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addFlavor()} placeholder="Nuevo sabor..."
                                className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                            <button onClick={addFlavor} className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: PINK }}><Plus size={16} /></button>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button onClick={() => onDelete(index)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 border border-red-200 text-sm font-bold hover:bg-red-50">
                            <Trash2 size={14} /> Eliminar producto
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Panel de Pedidos ───────────────────────────────────────────────────────
const STATUS_COLORS = {
    pendiente: { bg: '#fff7ed', text: '#c2410c', icon: <Clock size={13} /> },
    confirmado: { bg: '#f0fdf4', text: '#15803d', icon: <CheckCircle size={13} /> },
    cancelado: { bg: '#fef2f2', text: '#b91c1c', icon: <XCircle size={13} /> },
};

function OrdersPanel() {
    const [orders, setOrders] = useState(() => {
        try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch { return []; }
    });
    const [expanded, setExpanded] = useState(null);
    const [filter, setFilter] = useState('todos');

    const updateStatus = (id, status) => {
        const updated = orders.map(o => o.id === id ? { ...o, status } : o);
        setOrders(updated);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    };

    const deleteOrder = (id) => {
        if (!confirm('¿Eliminar este pedido?')) return;
        const updated = orders.filter(o => o.id !== id);
        setOrders(updated);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    };

    const filtered = filter === 'todos' ? orders : orders.filter(o => o.status === filter);
    const totalRevenue = orders.filter(o => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0);

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total pedidos', value: orders.length, color: PINK },
                    { label: 'Pendientes', value: orders.filter(o => o.status === 'pendiente').length, color: '#c2410c' },
                    { label: 'Ingresos', value: `$${totalRevenue.toFixed(2)}`, color: '#15803d' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border p-4 text-center" style={{ borderColor: '#f0dde3' }}>
                        <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
                {['todos', 'pendiente', 'confirmado', 'cancelado'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-1 rounded-full text-sm font-bold capitalize transition-all"
                        style={{ backgroundColor: filter === f ? PINK : 'transparent', color: filter === f ? '#fff' : PINK, border: `2px solid ${PINK}` }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No hay pedidos {filter !== 'todos' ? filter + 's' : ''}.</p>
                </div>
            ) : filtered.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#f0dde3' }}>
                    {/* Header */}
                    <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-pink-50 transition-colors"
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ backgroundColor: PINK }}>
                            {order.client?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-800 truncate">{order.client?.name || 'Cliente desconocido'}</p>
                            <p className="text-xs text-slate-400">{order.date} · {order.items?.length} producto(s)</p>
                        </div>
                        <span className="font-black text-sm mr-2" style={{ color: PINK }}>${order.total?.toFixed(2)}</span>
                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full capitalize"
                            style={{ backgroundColor: STATUS_COLORS[order.status]?.bg, color: STATUS_COLORS[order.status]?.text }}>
                            {STATUS_COLORS[order.status]?.icon} {order.status}
                        </span>
                        {expanded === order.id ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                    </button>

                    {/* Detalle */}
                    {expanded === order.id && (
                        <div className="border-t p-4 space-y-4" style={{ borderColor: '#f0dde3' }}>
                            {/* Info cliente */}
                            <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
                                <p className="font-bold text-slate-700">{order.client?.name}</p>
                                {order.client?.code && <p className="text-slate-500">Código: {order.client.code}</p>}
                                {order.client?.phone && <p className="text-slate-500">Tel: {order.client.phone}</p>}
                                {order.client?.address && <p className="text-slate-500">Dir: {order.client.address}</p>}
                                {order.notes && <p className="text-slate-500 italic">Nota: {order.notes}</p>}
                            </div>

                            {/* Tabla de productos */}
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-500 border-b" style={{ borderColor: '#f0dde3' }}>
                                        <th className="text-left pb-2">Producto</th>
                                        <th className="text-center pb-2">Sabor</th>
                                        <th className="text-center pb-2">Cant.</th>
                                        <th className="text-right pb-2">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map((item, i) => (
                                        <tr key={i} className="border-b" style={{ borderColor: '#f0dde3' }}>
                                            <td className="py-2 font-semibold text-slate-800">{item.name}</td>
                                            <td className="py-2 text-center text-slate-500">{item.flavor}</td>
                                            <td className="py-2 text-center text-slate-600">{item.qty}</td>
                                            <td className="py-2 text-right font-bold" style={{ color: PINK }}>${(item.price * item.qty).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="pt-2 font-black text-slate-700">TOTAL</td>
                                        <td className="pt-2 text-right font-black text-lg" style={{ color: PINK }}>${order.total?.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* Acciones */}
                            <div className="flex gap-2 flex-wrap">
                                {['pendiente', 'confirmado', 'cancelado'].map(s => (
                                    <button key={s} onClick={() => updateStatus(order.id, s)}
                                        className="px-4 py-2 rounded-full text-xs font-bold capitalize transition-all"
                                        style={{
                                            backgroundColor: order.status === s ? STATUS_COLORS[s].text : 'transparent',
                                            color: order.status === s ? '#fff' : STATUS_COLORS[s].text,
                                            border: `2px solid ${STATUS_COLORS[s].text}`
                                        }}>
                                        {s}
                                    </button>
                                ))}
                                <button onClick={() => deleteOrder(order.id)}
                                    className="ml-auto px-4 py-2 rounded-full text-xs font-bold text-red-400 border border-red-200 hover:bg-red-50">
                                    <Trash2 size={12} className="inline mr-1" /> Eliminar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── App principal ──────────────────────────────────────────────────────────
function AdminApp() {
    const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
    const [tab, setTab] = useState('products'); // 'products' | 'clients' | 'orders'
    const [products, setProducts] = useState(() => {
        try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : DEFAULT_PRODUCTS; } catch { return DEFAULT_PRODUCTS; }
    });
    const [clients, setClients] = useState(() => {
        try { const s = localStorage.getItem(CLIENTS_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
    });
    const [saved, setSaved] = useState(false);

    if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

    const logout = () => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); };

    const save = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const updateProduct = (index, updated) => setProducts(prev => prev.map((p, i) => i === index ? updated : p));
    const deleteProduct = (index) => { if (!confirm('¿Eliminar este producto?')) return; setProducts(prev => prev.filter((_, i) => i !== index)); };
    const addProduct = () => setProducts(prev => [...prev, { id: Date.now(), name: 'Nuevo Producto', tag: 'NUEVO', desc: '', price: 0, image: '', image2: '', weight: '', shelf: '90 días', flavors: [] }]);
    const reset = () => { if (!confirm('¿Restaurar productos por defecto?')) return; setProducts(DEFAULT_PRODUCTS); localStorage.removeItem(STORAGE_KEY); };

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: '#faf0f1' }}>
            {/* Header */}
            <div className="sticky top-0 z-40 border-b bg-white" style={{ borderColor: '#f0dde3' }}>
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-black text-xl text-slate-900">Panel Admin <span style={{ color: PINK }}>JULLS</span></h1>
                        <p className="text-xs text-slate-400">Los cambios se guardan en el navegador</p>
                    </div>
                    <div className="flex gap-2">
                        <a href="/" className="px-4 py-2 rounded-full text-sm font-bold border-2 text-slate-600 border-slate-200 hover:bg-slate-50">Ver tienda</a>
                        <button onClick={save} className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white transition-all" style={{ backgroundColor: saved ? '#22c55e' : PINK }}>
                            <Save size={15} /> {saved ? '¡Guardado!' : 'Guardar'}
                        </button>
                        <button onClick={logout} className="p-2 rounded-full border-2 text-slate-400 border-slate-200 hover:bg-slate-50" title="Cerrar sesión">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
                {/* Tabs */}
                <div className="max-w-3xl mx-auto px-6 flex gap-1 pb-3">
                    {[['products', <Package size={15} />, 'Productos'], ['clients', <Users size={15} />, 'Clientes'], ['orders', <ShoppingBag size={15} />, 'Pedidos']].map(([key, icon, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
                            style={{ backgroundColor: tab === key ? PINK : 'transparent', color: tab === key ? '#fff' : PINK, border: `2px solid ${PINK}` }}>
                            {icon} {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
                {tab === 'clients' && <ClientsPanel clients={clients} setClients={setClients} />}

                {tab === 'orders' && <OrdersPanel />}

                {tab === 'products' && (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-black text-slate-800 text-lg">{products.length} productos · mín. {MIN_QTY} uds. por pedido</h2>
                            <div className="flex gap-2">
                                <button onClick={reset} className="text-xs text-slate-400 hover:text-slate-600 underline">Restaurar defaults</button>
                                <button onClick={addProduct} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white" style={{ backgroundColor: PINK }}>
                                    <Plus size={15} /> Agregar producto
                                </button>
                            </div>
                        </div>
                        {products.map((p, i) => (
                            <ProductForm key={p.id} product={p} index={i} onChange={updateProduct} onDelete={deleteProduct} />
                        ))}
                        {products.length === 0 && <div className="text-center py-16 text-slate-400"><p className="font-medium">No hay productos.</p></div>}
                        <div className="pt-4 text-center">
                            <button onClick={save} className="px-8 py-3 rounded-full font-bold text-white text-base" style={{ backgroundColor: PINK }}>
                                <Save size={16} className="inline mr-2" /> Guardar cambios
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const container = document.getElementById('admin');
if (container) createRoot(container).render(<AdminApp />);
