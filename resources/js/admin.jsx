import './bootstrap';
import '../css/app.css';

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp, Upload, LogOut } from 'lucide-react';

const PINK = '#bf7691';
const STORAGE_KEY = 'julls_products';
const BANNER_KEY = 'julls_banner';

const DEFAULT_BANNER = {
    imagePc: '/313790.jpg',
    imageMobile: '/313794.jpg',
    title: '-15% EN TODAS\nLAS GALLETAS',
    subtitle: 'Hasta el 31 de marzo · Solo pedidos online',
    badgeLabel: 'CÓDIGO:',
    badge: 'GALLETAS15',
};
const AUTH_KEY = 'julls_admin_auth';

const DEFAULT_PRODUCTS = [
    {
        id: 1, name: 'Choco Crunch', tag: 'BESTSELLER',
        desc: 'Galleta rellena de chocolate y avellanas. Experiencia New York en cada mordida.',
        price: 4.80, image: '/313790.jpg', weight: '150g / 6 unid.', shelf: '90 días',
        flavors: ['Chocolate Negro', 'Chocolate con Leche', 'Chocolate Blanco'],
    },
    {
        id: 2, name: 'Velvet Cream', tag: 'PREMIUM',
        desc: 'Masa Red Velvet con centro cremoso. Ideal para regalo o consumo gourmet.',
        price: 5.50, image: '/313792.jpg', weight: '150g / 6 unid.', shelf: '90 días',
        flavors: ['Crema Vainilla', 'Crema Fresa', 'Crema Limón'],
    },
    {
        id: 3, name: 'Minis Crunch', tag: 'BITE-SIZE',
        desc: 'Sin relleno. Alta rotación, empaque snack. Perfectas para compartir.',
        price: 1.90, image: '/313794.jpg', weight: 'Stand-up Pouch', shelf: '90 días',
        flavors: ['Clásica', 'Canela', 'Cacao'],
    },
];

const TAGS = ['BESTSELLER', 'PREMIUM', 'BITE-SIZE', 'NUEVO', 'OFERTA', 'LIMITADO'];

// ── Login ──────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');

    const submit = (e) => {
        e.preventDefault();
        if (user === 'admin' && pass === 'admin') {
            sessionStorage.setItem(AUTH_KEY, '1');
            onLogin();
        } else {
            setError('Usuario o contraseña incorrectos');
        }
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
                        <input
                            type="text" value={user} onChange={e => setUser(e.target.value)}
                            placeholder="admin" autoFocus
                            className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2"
                            style={{ borderColor: '#f0dde3' }}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Contraseña</label>
                        <input
                            type="password" value={pass} onChange={e => setPass(e.target.value)}
                            placeholder="••••••"
                            className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2"
                            style={{ borderColor: '#f0dde3' }}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    <button type="submit" className="w-full py-3 rounded-full font-bold text-white mt-2" style={{ backgroundColor: PINK }}>
                        Entrar
                    </button>
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
            <input
                type={type} step={step} value={value} placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#f0dde3' }}
            />
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

    const addFlavor = () => {
        if (!newFlavor.trim()) return;
        update('flavors', [...product.flavors, newFlavor.trim()]);
        setNewFlavor('');
    };

    const removeFlavor = (i) => update('flavors', product.flavors.filter((_, fi) => fi !== i));

    const handleImageFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => update('image', ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleImageFile2 = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => update('image2', ev.target.result);
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#f0dde3' }}>
            <button
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-pink-50 transition-colors"
                onClick={() => setOpen(o => !o)}
            >
                {product.image
                    ? <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                    : <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-slate-100 flex items-center justify-center"><Upload size={16} className="text-slate-300" /></div>
                }
                <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 truncate">{product.name || 'Sin nombre'}</p>
                    <p className="text-sm font-bold" style={{ color: PINK }}>${Number(product.price).toFixed(2)}</p>
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
                        <textarea value={product.desc} onChange={e => update('desc', e.target.value)}
                            rows={3} className="w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none"
                            style={{ borderColor: '#f0dde3' }} />
                    </div>

                    {/* Imagen principal */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Imagen principal</label>
                        <div className="flex gap-3 items-start">
                            <div className="w-24 h-24 rounded-xl border overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center" style={{ borderColor: '#f0dde3' }}>
                                {product.image
                                    ? <img src={product.image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                                    : <Upload size={20} className="text-slate-300" />
                                }
                            </div>
                            <div className="flex-1 space-y-2">
                                <input type="file" accept="image/*" ref={fileRef} onChange={handleImageFile} className="hidden" />
                                <button onClick={() => fileRef.current.click()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-colors hover:bg-pink-50 w-full justify-center"
                                    style={{ borderColor: PINK, color: PINK }}>
                                    <Upload size={15} /> Subir imagen desde PC
                                </button>
                                <input type="text" value={product.image.startsWith('data:') ? '' : product.image}
                                    onChange={e => update('image', e.target.value)}
                                    placeholder="O pega una URL: https://..."
                                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                            </div>
                        </div>
                    </div>

                    {/* Segunda imagen (hover) */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Segunda imagen <span className="font-normal text-slate-400 normal-case">(aparece al pasar el mouse)</span></label>
                        <div className="flex gap-3 items-start">
                            <div className="w-24 h-24 rounded-xl border overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center" style={{ borderColor: '#f0dde3' }}>
                                {product.image2
                                    ? <img src={product.image2} alt="preview2" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                                    : <Upload size={20} className="text-slate-300" />
                                }
                            </div>
                            <div className="flex-1 space-y-2">
                                <input type="file" accept="image/*" ref={fileRef2} onChange={handleImageFile2} className="hidden" />
                                <button onClick={() => fileRef2.current.click()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-colors hover:bg-pink-50 w-full justify-center"
                                    style={{ borderColor: PINK, color: PINK }}>
                                    <Upload size={15} /> Subir segunda imagen
                                </button>
                                <input type="text" value={product.image2 && !product.image2.startsWith('data:') ? product.image2 : ''}
                                    onChange={e => update('image2', e.target.value)}
                                    placeholder="O pega una URL: https://..."
                                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                            </div>
                        </div>
                    </div>

                    {/* Sabores */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Sabores / Variantes</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {product.flavors.map((f, i) => (
                                <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: PINK }}>
                                    {f}
                                    <button onClick={() => removeFlavor(i)} className="ml-1 hover:opacity-70"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={newFlavor} onChange={e => setNewFlavor(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addFlavor()}
                                placeholder="Nuevo sabor..."
                                className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                            <button onClick={addFlavor} className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: PINK }}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button onClick={() => onDelete(index)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 border border-red-200 text-sm font-bold hover:bg-red-50 transition-colors">
                            <Trash2 size={14} /> Eliminar producto
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── App principal ──────────────────────────────────────────────────────────
function AdminApp() {
    const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
    const [products, setProducts] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
        } catch { return DEFAULT_PRODUCTS; }
    });
    const [banner, setBanner] = useState(() => {
        try {
            const saved = localStorage.getItem(BANNER_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_BANNER;
        } catch { return DEFAULT_BANNER; }
    });
    const [saved, setSaved] = useState(false);
    const bannerPcRef = useRef();
    const bannerMobileRef = useRef();

    if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

    const logout = () => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); };

    const save = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        localStorage.setItem(BANNER_KEY, JSON.stringify(banner));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const updateProduct = (index, updated) => setProducts(prev => prev.map((p, i) => i === index ? updated : p));
    const deleteProduct = (index) => { if (!confirm('¿Eliminar este producto?')) return; setProducts(prev => prev.filter((_, i) => i !== index)); };
    const addProduct = () => setProducts(prev => [...prev, { id: Date.now(), name: 'Nuevo Producto', tag: 'NUEVO', desc: '', price: 0, image: '', weight: '', shelf: '90 días', flavors: [] }]);
    const reset = () => { if (!confirm('¿Restaurar productos por defecto?')) return; setProducts(DEFAULT_PRODUCTS); localStorage.removeItem(STORAGE_KEY); };

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: '#faf0f1' }}>
            <div className="sticky top-0 z-40 border-b bg-white" style={{ borderColor: '#f0dde3' }}>
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-black text-xl text-slate-900">Panel Admin <span style={{ color: PINK }}>JULLS</span></h1>
                        <p className="text-xs text-slate-400">Los cambios se guardan en el navegador</p>
                    </div>
                    <div className="flex gap-2">
                        <a href="/" className="px-4 py-2 rounded-full text-sm font-bold border-2 text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors">Ver tienda</a>
                        <button onClick={save} className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white transition-all" style={{ backgroundColor: saved ? '#22c55e' : PINK }}>
                            <Save size={15} /> {saved ? '¡Guardado!' : 'Guardar'}
                        </button>
                        <button onClick={logout} className="p-2 rounded-full border-2 text-slate-400 border-slate-200 hover:bg-slate-50 transition-colors" title="Cerrar sesión">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
                {/* BANNER EDITOR */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-6" style={{ borderColor: '#f0dde3' }}>
                    <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: '#f0dde3', backgroundColor: '#fdf5f7' }}>
                        <span className="text-lg">🖼️</span>
                        <h2 className="font-black text-slate-800">Banner principal</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Imágenes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* PC */}
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Imagen desktop</label>
                                <div className="flex gap-3 items-start">
                                    <div className="w-20 h-14 rounded-xl border overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center" style={{ borderColor: '#f0dde3' }}>
                                        {banner.imagePc
                                            ? <img src={banner.imagePc} alt="pc" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                                            : <Upload size={16} className="text-slate-300" />}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input type="file" accept="image/*" ref={bannerPcRef} className="hidden"
                                            onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setBanner(b => ({ ...b, imagePc: ev.target.result })); r.readAsDataURL(f); }} />
                                        <button onClick={() => bannerPcRef.current.click()}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold hover:bg-pink-50 w-full justify-center"
                                            style={{ borderColor: PINK, color: PINK }}>
                                            <Upload size={13} /> Subir imagen
                                        </button>
                                        <input type="text" value={banner.imagePc.startsWith('data:') ? '' : banner.imagePc}
                                            onChange={e => setBanner(b => ({ ...b, imagePc: e.target.value }))}
                                            placeholder="URL de imagen..."
                                            className="w-full border rounded-xl px-3 py-2 text-xs outline-none" style={{ borderColor: '#f0dde3' }} />
                                    </div>
                                </div>
                            </div>
                            {/* Mobile */}
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Imagen móvil</label>
                                <div className="flex gap-3 items-start">
                                    <div className="w-20 h-14 rounded-xl border overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center" style={{ borderColor: '#f0dde3' }}>
                                        {banner.imageMobile
                                            ? <img src={banner.imageMobile} alt="mobile" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                                            : <Upload size={16} className="text-slate-300" />}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input type="file" accept="image/*" ref={bannerMobileRef} className="hidden"
                                            onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setBanner(b => ({ ...b, imageMobile: ev.target.result })); r.readAsDataURL(f); }} />
                                        <button onClick={() => bannerMobileRef.current.click()}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold hover:bg-pink-50 w-full justify-center"
                                            style={{ borderColor: PINK, color: PINK }}>
                                            <Upload size={13} /> Subir imagen
                                        </button>
                                        <input type="text" value={banner.imageMobile.startsWith('data:') ? '' : banner.imageMobile}
                                            onChange={e => setBanner(b => ({ ...b, imageMobile: e.target.value }))}
                                            placeholder="URL de imagen..."
                                            className="w-full border rounded-xl px-3 py-2 text-xs outline-none" style={{ borderColor: '#f0dde3' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Textos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Título <span className="font-normal normal-case text-slate-400">(usa \n para salto de línea)</span></label>
                                <textarea value={banner.title} rows={2} onChange={e => setBanner(b => ({ ...b, title: e.target.value }))}
                                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none" style={{ borderColor: '#f0dde3' }} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Subtítulo</label>
                                <input type="text" value={banner.subtitle} onChange={e => setBanner(b => ({ ...b, subtitle: e.target.value }))}
                                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Etiqueta código</label>
                                <input type="text" value={banner.badgeLabel} onChange={e => setBanner(b => ({ ...b, badgeLabel: e.target.value }))}
                                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Código promocional</label>
                                <input type="text" value={banner.badge} onChange={e => setBanner(b => ({ ...b, badge: e.target.value }))}
                                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-black text-slate-800 text-lg">{products.length} productos</h2>                    <div className="flex gap-2">
                        <button onClick={reset} className="text-xs text-slate-400 hover:text-slate-600 underline">Restaurar defaults</button>
                        <button onClick={addProduct} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white" style={{ backgroundColor: PINK }}>
                            <Plus size={15} /> Agregar producto
                        </button>
                    </div>
                </div>

                {products.map((p, i) => (
                    <ProductForm key={p.id} product={p} index={i} onChange={updateProduct} onDelete={deleteProduct} />
                ))}

                {products.length === 0 && (
                    <div className="text-center py-16 text-slate-400"><p className="font-medium">No hay productos. Agrega uno.</p></div>
                )}

                <div className="pt-4 text-center">
                    <button onClick={save} className="px-8 py-3 rounded-full font-bold text-white text-base" style={{ backgroundColor: PINK }}>
                        <Save size={16} className="inline mr-2" /> Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
}

const container = document.getElementById('admin');
if (container) createRoot(container).render(<AdminApp />);
