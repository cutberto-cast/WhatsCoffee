'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Package, Tag, Layers, Image as ImageIcon, Settings, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [menuAbierto, setMenuAbierto] = useState(false);

    const [estaAutenticado, setEstaAutenticado] = useState(false);
    const [email, setEmail] = useState('');
    const [verificando, setVerificando] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        let montado = true;

        const verificarSesion = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (montado) {
                if (session) {
                    setEstaAutenticado(true);
                    setEmail(session.user.email || '');
                } else {
                    setEstaAutenticado(false);
                    if (pathname !== '/admin/login') {
                        window.location.href = '/admin/login';
                    }
                }
                setVerificando(false);
            }
        };

        verificarSesion();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (montado) {
                    if (session) {
                        setEstaAutenticado(true);
                        setEmail(session.user.email || '');
                    } else {
                        setEstaAutenticado(false);
                        if (pathname !== '/admin/login') {
                            window.location.href = '/admin/login';
                        }
                    }
                }
            }
        );

        return () => {
            montado = false;
            subscription.unsubscribe();
        };
    }, [supabase, pathname]);

    if (verificando) {
        return (
            <div className="min-h-screen bg-[var(--color-base)] flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[var(--color-borde)] border-t-[var(--color-acento)] rounded-full animate-spin" />
            </div>
        );
    }

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (!estaAutenticado) {
        return null;
    }

    const menuItems = [
        { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
        { href: '/admin/productos', label: 'Productos', Icon: Package },
        { href: '/admin/categorias', label: 'Categorías', Icon: Tag },
        { href: '/admin/banners', label: 'Banners', Icon: ImageIcon },
        { href: '/admin/toppings', label: 'Toppings', Icon: Layers },
        { href: '/admin/configuracion', label: 'Configuración', Icon: Settings },
    ];

    const handleCerrarSesion = async () => {
        await supabase.auth.signOut();
        window.location.href = '/admin/login';
    };

    return (
        <div className="min-h-screen bg-[var(--color-base)] flex">
            {/* Sidebar Desktop */}
            <aside
                className="hidden lg:flex w-56 flex-col fixed h-full z-30"
                style={{ background: 'linear-gradient(180deg, var(--sidebar-bg-from) 0%, var(--sidebar-bg-to) 100%)' }}
            >
                <div className="p-6 border-b border-white/10">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-white font-semibold text-sm">Nube Alta Cafe</h1>
                        <p className="text-[var(--sidebar-text)] text-xs tracking-wider uppercase">Panel de administración</p>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2 rounded-lg
                                    text-[13px] tracking-wide transition-all duration-200
                                    ${isActive
                                        ? 'text-white border-l-2 border-[#606C38] pl-[10px] bg-[rgba(255,255,255,0.05)]'
                                        : 'text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.03)] border-l-2 border-transparent pl-[10px]'}
                                `}
                            >
                                <item.Icon
                                    size={16}
                                    strokeWidth={1.5}
                                    className={isActive ? 'text-[#606C38]' : 'text-[rgba(255,255,255,0.45)]'}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="mb-4 px-2">
                        <p className="text-[11px] text-[rgba(255,255,255,0.4)] truncate">{email}</p>
                    </div>
                    <button
                        onClick={handleCerrarSesion}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg text-[13px] transition-colors"
                    >
                        <LogOut size={14} strokeWidth={1.5} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--color-espresso-dark)] border-b border-white/10 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className="text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
                        aria-label="Menú"
                    >
                        {menuAbierto ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <h1 className="text-white font-semibold text-sm">Nube Alta Cafe</h1>
                </div>
            </header>

            {/* Mobile Menu overlay */}
            {menuAbierto && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuAbierto(false)} />
                    <div
                        className="absolute left-0 top-0 bottom-0 w-64 flex flex-col animate-slide-in-left"
                        style={{ background: 'linear-gradient(180deg, var(--sidebar-bg-from) 0%, var(--sidebar-bg-to) 100%)' }}
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-white font-semibold text-sm">Nube Alta Cafe</h1>
                                <p className="text-[var(--sidebar-text)] text-xs tracking-wider uppercase">Panel de administración</p>
                            </div>
                            <button onClick={() => setMenuAbierto(false)} className="text-[rgba(255,255,255,0.45)] hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="flex-1 py-6 px-4 space-y-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMenuAbierto(false)}
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-lg
                                            text-[13px] tracking-wide transition-all duration-200
                                            ${isActive
                                                ? 'text-white border-l-2 border-[#606C38] pl-[10px] bg-[rgba(255,255,255,0.05)]'
                                                : 'text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.03)] border-l-2 border-transparent pl-[10px]'}
                                        `}
                                    >
                                        <item.Icon
                                            size={16}
                                            strokeWidth={1.5}
                                            className={isActive ? 'text-[#606C38]' : 'text-[rgba(255,255,255,0.45)]'}
                                        />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t border-white/10">
                            <div className="mb-4 px-2">
                                <p className="text-[11px] text-[rgba(255,255,255,0.4)] truncate">{email}</p>
                            </div>
                            <button
                                onClick={handleCerrarSesion}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg text-[13px] transition-colors"
                            >
                                <LogOut size={14} strokeWidth={1.5} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:ml-56 pt-16 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
