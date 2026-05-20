import './bootstrap';
import '../css/app.css';

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Gift, Clock, Mail, ArrowLeft, Sparkles, Heart, CheckCircle2, Send, Instagram, AlertCircle } from 'lucide-react';

const PINK = '#bf7691';
const LIGHT = '#faf0f1';
const DARK_NAVY = '#3a2a30';

const ObsequiosApp = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState({ days: 8, hours: 14, minutes: 32, seconds: 45 });

    // Cargar email si ya se registró antes
    useEffect(() => {
        const saved = localStorage.getItem('julls_gifts_interest');
        if (saved) {
            setSubscribed(true);
            setEmail(saved);
        }
    }, []);

    // Countdown logic: Target is 8 days, 14 hours, etc. from component mount, but let's count down every second.
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                } else {
                    clearInterval(timer);
                    return prev;
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        setError('');

        if (!email || !email.includes('@')) {
            setError('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        // Simular llamada a API e integrar con localStorage
        localStorage.setItem('julls_gifts_interest', email);
        setSubscribed(true);
    };

    return (
        <div className="min-h-screen font-sans flex flex-col justify-between" style={{ backgroundColor: LIGHT }}>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-12px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-sparkle-slow {
                    animation: sparkle 4s ease-in-out infinite;
                }
                .animate-sparkle-fast {
                    animation: sparkle 2.5s ease-in-out infinite;
                }
                .animate-slide-up {
                    animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {/* NAV */}
            <nav className="sticky top-0 z-40 border-b bg-white shadow-sm" style={{ borderColor: '#f0dde3' }}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <img src="/313790.jpg" alt="Julls Logo" className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-black text-lg tracking-tighter" style={{ color: PINK }}>
                            JULLS <span className="text-slate-700">Repostería</span>
                        </span>
                    </a>
                    <a
                        href="/"
                        className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition-all border-2"
                        style={{ color: PINK, borderColor: PINK }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = PINK;
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = PINK;
                        }}
                    >
                        <ArrowLeft size={16} /> Volver a la Tienda
                    </a>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="relative flex-1 flex items-center justify-center px-4 py-12 md:py-20 overflow-hidden">
                {/* FLOATING DECORATIONS */}
                <div className="absolute top-20 left-[10%] text-pink-300 opacity-60 animate-sparkle-slow pointer-events-none">
                    <Sparkles size={36} />
                </div>
                <div className="absolute bottom-20 right-[10%] text-pink-300 opacity-60 animate-sparkle-fast pointer-events-none">
                    <Sparkles size={28} />
                </div>
                <div className="absolute top-40 right-[15%] text-pink-200 opacity-40 animate-float pointer-events-none">
                    <Heart size={42} style={{ fill: '#ffcdd2' }} />
                </div>
                <div className="absolute bottom-40 left-[12%] text-pink-200 opacity-40 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>
                    <Heart size={30} style={{ fill: '#ffcdd2' }} />
                </div>

                <div className="w-full max-w-4xl bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-[0_30px_70px_rgba(191,118,145,0.15)] border border-white/80 overflow-hidden animate-slide-up flex flex-col md:flex-row items-center">
                    {/* Left Column: Premium Illustration */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex justify-center items-center bg-gradient-to-tr from-pink-50/50 to-white/30 h-full">
                        <div className="relative animate-float">
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-pink-200/40 rounded-full blur-3xl scale-95 animate-pulse" />
                            <img
                                src="/obsequios_maintenance.png"
                                alt="Caja de obsequios y repostería gourmet"
                                className="relative rounded-3xl object-contain max-h-[320px] md:max-h-[380px] drop-shadow-[0_20px_35px_rgba(191,118,145,0.3)] transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute -bottom-4 -right-4 bg-white shadow-xl rounded-2xl px-4 py-2 border flex items-center gap-2 animate-bounce" style={{ borderColor: '#f0dde3' }}>
                                <span className="text-xl">🎁</span>
                                <span className="text-xs font-black text-slate-800 tracking-tight">Muy pronto</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information & Interaction */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 tracking-wide w-fit" style={{ backgroundColor: '#f5dde5', color: PINK }}>
                            <Gift size={14} /> DETALLES ÚNICOS & REGALOS
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3">
                            ¡Sección de Obsequios <br />
                            <span style={{ color: PINK }}>en el Horno! 🍪✨</span>
                        </h1>
                        
                        <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6">
                            Estamos diseñando y horneando los empaques más dulces, cajas de regalo exclusivas y combinaciones deliciosas para tus momentos más especiales. ¡El regalo perfecto está por llegar!
                        </p>

                        {/* COUNTDOWN TIMER */}
                        <div className="mb-8">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-1">
                                <Clock size={12} className="text-pink-400" /> Lanzamiento estimado en:
                            </p>
                            <div className="grid grid-cols-4 gap-3 text-center">
                                {[
                                    { label: 'Días', val: timeLeft.days },
                                    { label: 'Horas', val: timeLeft.hours },
                                    { label: 'Minutos', val: timeLeft.minutes },
                                    { label: 'Segundos', val: timeLeft.seconds },
                                ].map((item, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-2 md:p-3 border shadow-sm" style={{ borderColor: '#f0dde3' }}>
                                        <span className="text-xl md:text-2xl font-black block" style={{ color: PINK }}>
                                            {String(item.val).padStart(2, '0')}
                                        </span>
                                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* REGISTRATION FORM / SUCCESS */}
                        {!subscribed ? (
                            <form onSubmit={handleSubscribe} className="space-y-3">
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                    ¡Sé el primero en enterarte del lanzamiento!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="w-full pl-11 pr-4 py-3 rounded-full text-sm outline-none border focus:ring-2 focus:ring-pink-200 transition-all text-slate-700 bg-white"
                                            style={{ borderColor: '#f0dde3' }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md flex-shrink-0"
                                        style={{ backgroundColor: PINK }}
                                    >
                                        Avisarme <Send size={14} />
                                    </button>
                                </div>
                                {error && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold mt-1">
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="p-4 rounded-2xl border flex items-start gap-3 bg-green-50/50 animate-fade-in" style={{ borderColor: '#bbf7d0' }}>
                                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-green-800 text-sm">¡Te has registrado con éxito!</p>
                                    <p className="text-xs text-green-600 mt-0.5">Te enviaremos un correo dulce tan pronto como la sección de obsequios esté lista.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer style={{ backgroundColor: '#3a2a30', color: '#e8d5db' }}>
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center gap-3">
                            <img src="/313790.jpg" alt="Julls" className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-black text-sm tracking-tighter" style={{ color: '#e8a0b4' }}>
                                JULLS <span className="text-white">Repostería</span>
                            </span>
                        </div>
                        <div className="text-center md:text-right text-xs opacity-70">
                            Galletas de autor elaboradas con amor e ingredientes seleccionados.
                        </div>
                    </div>
                    {/* Bottom bar */}
                    <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs opacity-40">
                        <span>© 2026 JULLS Repostería · Todos los derechos reservados</span>
                        <span>Hecho con 🍪 y mucho amor</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const container = document.getElementById('obsequios');
if (container) {
    createRoot(container).render(<ObsequiosApp />);
}
