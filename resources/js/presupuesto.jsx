import './bootstrap';
import '../css/app.css';

import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, ChevronLeft, ChevronRight, CheckCircle2, Pencil, Check, X, Upload } from 'lucide-react';

const PINK = '#bf7691';
const LIGHT = '#faf0f1';

// Inline editable text component
const Editable = ({ value, onChange, editing, className = '', multiline = false, style = {} }) => {
    if (!editing) return multiline
        ? <p className={className} style={style}>{value}</p>
        : <span className={className} style={style}>{value}</span>;

    return multiline
        ? <textarea
            className={`border-2 rounded-lg p-1 w-full bg-white/80 resize-none ${className}`}
            style={{ borderColor: PINK, ...style }}
            value={value}
            rows={3}
            onChange={e => onChange(e.target.value)}
          />
        : <input
            className={`border-2 rounded-lg px-2 py-0.5 bg-white/80 ${className}`}
            style={{ borderColor: PINK, ...style }}
            value={value}
            onChange={e => onChange(e.target.value)}
          />;
};

const AUTH_KEY = 'julls_admin_auth';
const PRESUPUESTO_KEY = 'julls_presupuesto';

const DEFAULT_STATE = {
    p1: {
        badge: 'NUEVA YORK EN VALENCIA',
        title1: 'El Arte de la Galleta',
        titleHighlight: 'Perfecta',
        desc: 'Galletas de autor tipo New York, elaboradas con ingredientes funcionales y un proceso semi-industrial estandarizado que garantiza frescura y escalabilidad.',
        bullets: [
            'Registro Sanitario y CPE Vigentes',
            '90 días de vida de anaquel garantizados',
            'Ingredientes Premium (Mantequilla Real y Avellanas)',
            "Concepto 'Bake-at-home' para experiencia de frescura",
        ],
        productName: 'CHOCO CRUNCH',
        productSlogan: 'ORIGINAL RECIPE',
        productWeight: '150g / 6 Unid.',
        productMargin: '37.5%',
        productImage: '/313790.jpg',
    },
    p2: {
        cards: [
            { name: 'Choco Crunch', tag: 'CASH COW', slogan: 'Experiencia New York', desc: 'Nuestra insignia. Rellena de chocolate y avellanas. Alta percepción de valor.', tagBg: PINK, pouch: 'Pack 150g' },
            { name: 'Velvet Cream', tag: 'PREMIUM', slogan: 'Sofisticación Pura', desc: 'Masa Red Velvet con centro cremoso. Ideal para regalos y consumo gourmet.', tagBg: '#7c2d41', pouch: 'Pack 150g' },
            { name: 'Minis Crunch', tag: 'BITE-SIZE', slogan: 'Sabor en Movimiento', desc: 'Sin relleno. Alta rotación, empaque snack. Perfecto para cajas de pago.', tagBg: '#c58aa0', pouch: 'Stand-up Pouch' },
        ],
    },
    p3: {
        rows: [
            { name: 'Choco Crunch (150g)', dist: '$3.00', pvp: '$4.80', margin: '37.5%' },
            { name: 'Velvet Cream (150g)', dist: '$3.50', pvp: '$5.50', margin: '36.3%' },
            { name: 'Minis Choco Crunch', dist: '$1.20', pvp: '$1.90', margin: '36.8%' },
        ],
        ventajaTitle: 'Ventaja Competitiva',
        ventajaDesc: 'Nuestros márgenes superan el promedio de la categoría (25%), permitiendo a nuestros aliados comerciales recuperar la inversión más rápido mientras ofrecen un producto premium con alta tasa de recompra.',
        certTitle: 'Certificaciones y Garantías',
        certDesc: 'Procesos estandarizados bajo normativas sanitarias. Empaques de alta barrera que garantizan frescura sin necesidad de conservantes artificiales invasivos.',
        certs: ['CPE', 'GTIN', 'SISA'],
    },
    pageMeta: [
        { title: 'JULLS Repostería Artesanal', subtitle: 'Propuesta Comercial para Grandes Superficies y Bodegones Premium' },
        { title: 'Arquitectura de Portafolio', subtitle: 'Diversificación estratégica para maximizar la rotación de inventario' },
        { title: 'Productos Disponibles', subtitle: 'Garantizando la mayor rentabilidad por centímetro de anaquel' },
    ],
    footer: '© 2026 Julls Repostería, C.A. • Valencia, Venezuela • Estrategia de Crecimiento',
};

const loadSaved = () => {
    try { const s = localStorage.getItem(PRESUPUESTO_KEY); return s ? { ...DEFAULT_STATE, ...JSON.parse(s) } : DEFAULT_STATE; } catch { return DEFAULT_STATE; }
};

const PresupuestoApp = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const isAdmin = sessionStorage.getItem(AUTH_KEY) === '1';

    const initial = loadSaved();
    const [p1, setP1] = useState(initial.p1);
    const [p2, setP2] = useState(initial.p2);
    const [p3, setP3] = useState(initial.p3);
    const [pageMeta, setPageMeta] = useState(initial.pageMeta);
    const [footer, setFooter] = useState(initial.footer);
    const imgRef = useRef();

    const saveAll = () => {
        localStorage.setItem(PRESUPUESTO_KEY, JSON.stringify({ p1, p2, p3, pageMeta, footer }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const updateP2Card = (i, field, val) => {
        setP2(prev => ({ ...prev, cards: prev.cards.map((c, idx) => idx === i ? { ...c, [field]: val } : c) }));
    };

    const updateP3Row = (i, field, val) => {
        setP3(prev => ({ ...prev, rows: prev.rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r) }));
    };

    const pages = [
        {
            content: (
                <div className="flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="md:w-1/2 space-y-6">
                        <div className="inline-block px-4 py-1 rounded-full text-sm font-bold tracking-wider" style={{ backgroundColor: '#f5dde5', color: PINK }}>
                            <Editable value={p1.badge} onChange={v => setP1(s => ({ ...s, badge: v }))} editing={editing} />
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 leading-tight">
                            <Editable value={p1.title1} onChange={v => setP1(s => ({ ...s, title1: v }))} editing={editing} />{' '}
                            <span style={{ color: PINK }}>
                                <Editable value={p1.titleHighlight} onChange={v => setP1(s => ({ ...s, titleHighlight: v }))} editing={editing} />
                            </span>
                        </h1>
                        <Editable value={p1.desc} onChange={v => setP1(s => ({ ...s, desc: v }))} editing={editing} multiline className="text-lg text-slate-600 leading-relaxed" />
                        <ul className="space-y-3">
                            {p1.bullets.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: PINK }} />
                                    <Editable value={item} onChange={v => setP1(s => ({ ...s, bullets: s.bullets.map((b, bi) => bi === i ? v : b) }))} editing={editing} className="flex-1" />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-1/2 relative">
                        <div className="rounded-3xl p-8 border-2 shadow-2xl overflow-hidden" style={{ backgroundColor: '#fdf5f7', borderColor: '#f0dde3' }}>
                            <div className="aspect-square bg-white rounded-2xl flex items-center justify-center shadow-inner mb-4 overflow-hidden">
                                <div className="text-center px-6">
                                    <div className="relative w-40 h-40 mx-auto mb-4">
                                        <img src={p1.productImage} alt="Producto" className="w-40 h-40 rounded-full object-cover shadow-lg" />
                                        {editing && (
                                            <button onClick={() => imgRef.current.click()}
                                                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 text-white font-bold text-xs gap-1 flex-col hover:bg-black/60 transition-all">
                                                <Upload size={18} /> Cambiar
                                            </button>
                                        )}
                                        <input type="file" accept="image/*" ref={imgRef} className="hidden"
                                            onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setP1(s => ({ ...s, productImage: ev.target.result })); r.readAsDataURL(f); }} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        <Editable value={p1.productName} onChange={v => setP1(s => ({ ...s, productName: v }))} editing={editing} />
                                    </h3>
                                    <p className="font-bold tracking-widest text-sm italic" style={{ color: PINK }}>
                                        <Editable value={p1.productSlogan} onChange={v => setP1(s => ({ ...s, productSlogan: v }))} editing={editing} />
                                    </p>
                                </div>
                            </div>                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Peso Neto</p>
                                    <p className="text-xl font-black text-slate-800">
                                        <Editable value={p1.productWeight} onChange={v => setP1(s => ({ ...s, productWeight: v }))} editing={editing} />
                                    </p>
                                </div>
                                <div className="text-white px-4 py-2 rounded-xl text-center" style={{ backgroundColor: PINK }}>
                                    <p className="text-[10px] uppercase">Margen Retail</p>
                                    <p className="text-xl font-black">
                                        <Editable value={p1.productMargin} onChange={v => setP1(s => ({ ...s, productMargin: v }))} editing={editing} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
                    {p2.cards.map((item, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-white px-2 py-1 rounded-md mb-4 inline-block tracking-tighter" style={{ backgroundColor: item.tagBg }}>
                                    <Editable value={item.tag} onChange={v => updateP2Card(i, 'tag', v)} editing={editing} />
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">
                                    <Editable value={item.name} onChange={v => updateP2Card(i, 'name', v)} editing={editing} />
                                </h3>
                                <p className="text-xs font-semibold uppercase mb-3" style={{ color: PINK }}>
                                    <Editable value={item.slogan} onChange={v => updateP2Card(i, 'slogan', v)} editing={editing} />
                                </p>
                                <Editable value={item.desc} onChange={v => updateP2Card(i, 'desc', v)} editing={editing} multiline className="text-sm text-slate-500 mb-4 italic" />
                            </div>
                            <div className="pt-4 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-400 mb-1">Formato</p>
                                <p className="font-bold text-slate-800">
                                    <Editable value={item.pouch} onChange={v => updateP2Card(i, 'pouch', v)} editing={editing} />
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            content: (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-xl">
                        <table className="w-full text-left bg-white">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-900">PRODUCTO</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-900">COSTO DISTRIBUIDOR</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-900">PVP SUGERIDO</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-900 text-center">MARGEN RETAIL (%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {p3.rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-pink-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800"><Editable value={row.name} onChange={v => updateP3Row(i, 'name', v)} editing={editing} /></td>
                                        <td className="px-6 py-4 text-slate-600"><Editable value={row.dist} onChange={v => updateP3Row(i, 'dist', v)} editing={editing} /></td>
                                        <td className="px-6 py-4 text-slate-600"><Editable value={row.pvp} onChange={v => updateP3Row(i, 'pvp', v)} editing={editing} /></td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full text-sm font-black" style={{ backgroundColor: '#f5dde5', color: PINK }}>
                                                <Editable value={row.margin} onChange={v => updateP3Row(i, 'margin', v)} editing={editing} />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl text-white" style={{ backgroundColor: PINK }}>
                            <div className="flex items-center gap-3 mb-4">
                                <BarChart3 className="w-8 h-8" style={{ color: '#f5dde5' }} />
                                <h4 className="text-xl font-bold">
                                    <Editable value={p3.ventajaTitle} onChange={v => setP3(s => ({ ...s, ventajaTitle: v }))} editing={editing} className="text-white" />
                                </h4>
                            </div>
                            <Editable value={p3.ventajaDesc} onChange={v => setP3(s => ({ ...s, ventajaDesc: v }))} editing={editing} multiline className="text-sm leading-relaxed text-white/90" />
                        </div>
                        <div className="p-6 rounded-2xl border-2 border-dashed" style={{ backgroundColor: '#fdf5f7', borderColor: '#f0dde3' }}>
                            <h4 className="text-slate-800 font-bold mb-2 italic">
                                <Editable value={p3.certTitle} onChange={v => setP3(s => ({ ...s, certTitle: v }))} editing={editing} />
                            </h4>
                            <Editable value={p3.certDesc} onChange={v => setP3(s => ({ ...s, certDesc: v }))} editing={editing} multiline className="text-slate-600 text-xs mb-4" />
                            <div className="flex gap-4">
                                {p3.certs.map((k, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-xs" style={{ color: PINK }}>
                                            <Editable value={k} onChange={v => setP3(s => ({ ...s, certs: s.certs.map((c, ci) => ci === i ? v : c) }))} editing={editing} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ backgroundColor: LIGHT }}>
            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
                <div className="px-12 pt-12 pb-6 flex justify-between items-start border-b border-slate-50">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <img src="/313790.jpg" alt="Julls Logo" className="w-10 h-10 rounded-full object-cover" />
                            <span className="font-black tracking-tighter" style={{ color: PINK }}>
                                JULLS <span className="text-slate-700">Repostería</span>
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                            <Editable value={pageMeta[currentPage].title} onChange={v => setPageMeta(s => s.map((m, i) => i === currentPage ? { ...m, title: v } : m))} editing={editing} />
                        </h2>
                        <Editable value={pageMeta[currentPage].subtitle} onChange={v => setPageMeta(s => s.map((m, i) => i === currentPage ? { ...m, subtitle: v } : m))} editing={editing} className="text-slate-400 text-sm font-medium" />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-300 font-bold text-xl">{String(currentPage + 1).padStart(2, '0')} / 03</span>
                        {isAdmin && (
                            <div className="flex items-center gap-2">
                                {editing && (
                                    <button onClick={saveAll}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
                                        style={{ backgroundColor: saved ? '#22c55e' : '#3a2a30', color: '#fff' }}>
                                        <Check size={15} /> {saved ? '¡Guardado!' : 'Guardar'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setEditing(e => !e)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
                                    style={{ backgroundColor: editing ? '#f5dde5' : '#f5dde5', color: PINK }}
                                >
                                    {editing ? <><X size={15} /> Cerrar</> : <><Pencil size={15} /> Editar</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-12 py-10 min-h-[450px]">{pages[currentPage].content}</div>

                <div className="px-12 py-8 flex justify-between items-center" style={{ backgroundColor: '#faf0f1' }}>
                    <Editable value={footer} onChange={setFooter} editing={editing} className="text-xs text-slate-400 font-medium" />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 disabled:opacity-30 transition-all shadow-sm"
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5dde5'; e.currentTarget.style.color = PINK; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#475569'; }}
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                            disabled={currentPage === pages.length - 1}
                            className="p-3 rounded-full text-white disabled:opacity-30 transition-all shadow-md flex items-center gap-2 px-6 font-bold"
                            style={{ backgroundColor: PINK }}
                        >
                            {currentPage === pages.length - 1 ? 'Finalizar' : 'Siguiente'} <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const container = document.getElementById('presupuesto');
if (container) {
    createRoot(container).render(<PresupuestoApp />);
}
