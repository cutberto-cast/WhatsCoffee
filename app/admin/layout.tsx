'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

        // Verificar sesión inicial
        const verificarSesion = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (montado) {
                if (session) {
                    setEstaAutenticado(true);
                    setEmail(session.user.email || '');
                } else {
                    setEstaAutenticado(false);
                    // Si no está autenticado y no está en login, redirigir
                    if (pathname !== '/admin/login') {
                        window.location.href = '/admin/login';
                    }
                }
                setVerificando(false);
            }
        };

        verificarSesion();

        // Escuchar cambios de autenticación
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
            <div className="min-h-screen bg-cafe-900 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-cafe-500/30 border-t-cafe-400 rounded-full animate-spin" />
            </div>
        );
    }

    // Si está en login y no estamos verificando, muestra el children (page de login)
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Si no está autenticado y ya verificó, no renderiza Layout (se redirigirá solo)
    if (!estaAutenticado) {
        return null;
    }

    const menuItems = [
        { href: '/admin', label: 'Dashboard', icono: '📊' },
        { href: '/admin/productos', label: 'Productos', icono: '📦' },
        { href: '/admin/categorias', label: 'Categorías', icono: '📁' },
        { href: '/admin/banners', label: 'Banners', icono: '🖼️' },
        { href: '/admin/configuracion', label: 'Configuración', icono: '⚙️' },
    ];

    const handleCerrarSesion = async () => {
        await supabase.auth.signOut();
        window.location.href = '/admin/login';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-64 bg-cafe-900 flex-col fixed h-full z-30">
                <div className="p-6 border-b border-cafe-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cafe-500/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-cafe-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg">Nube Alta Cafe</h1>
                            <p className="text-cafe-400 text-xs">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === item.href
                                ? 'bg-cafe-500/20 text-cafe-300'
                                : 'text-cafe-400 hover:bg-cafe-800 hover:text-cafe-200'
                                }`}
                        >
                            <span className="text-lg">{item.icono}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-cafe-700">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 bg-cafe-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{email}</p>
                            <p className="text-cafe-500 text-[10px]">Administrador</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCerrarSesion}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-cafe-900 border-b border-cafe-700 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className="text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-cafe-800 transition-colors"
                        aria-label="Menú"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuAbierto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                    <h1 className="text-white font-bold">Nube Alta Cafe</h1>
                </div>
                <Link href="/" className="text-cafe-400 text-xs hover:text-cafe-300 transition-colors">
                    Ver Tienda →
                </Link>
            </header>

            {/* Mobile Menu overlay */}
            {menuAbierto && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMenuAbierto(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-cafe-900 animate-slide-in-left">
                        <div className="p-6 border-b border-cafe-700 flex justify-between items-center">
                            <h1 className="text-white font-bold text-lg">Nube Alta Cafe</h1>
                            <button onClick={() => setMenuAbierto(false)} className="text-cafe-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="py-4 px-3 space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuAbierto(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === item.href
                                        ? 'bg-cafe-500/20 text-cafe-300'
                                        : 'text-cafe-400 hover:bg-cafe-800 hover:text-cafe-200'
                                        }`}
                                >
                                    <span className="text-lg">{item.icono}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-cafe-700">
                            <button
                                onClick={handleCerrarSesion}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
