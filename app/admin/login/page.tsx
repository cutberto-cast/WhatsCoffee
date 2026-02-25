'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [verificando, setVerificando] = useState(true);

    const supabase = createClient();

    // Verificar si ya está autenticado
    useEffect(() => {
        const verificarSesion = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                window.location.href = '/admin';
            }
            setVerificando(false);
        };
        verificarSesion();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: contrasena,
        });

        if (authError) {
            setError('Credenciales incorrectas. Verifica tu email y contraseña.');
            setCargando(false);
        } else {
            window.location.href = '/admin';
        }
    };

    if (verificando) {
        return (
            <div className="min-h-screen bg-cafe-900 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-cafe-500/30 border-t-cafe-400 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cafe-800 via-cafe-900 to-cafe-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md animate-scale-in">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-cafe-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-cafe-500/30">
                        <svg className="w-10 h-10 text-cafe-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Nube Alta Cafe</h1>
                    <p className="text-cafe-300 text-sm mt-1">Panel de Administración</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Iniciar Sesión</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-cafe-200 mb-1.5">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@cafeorder.com"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-cafe-400 focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:border-transparent transition-all text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="contrasena" className="block text-xs font-medium text-cafe-200 mb-1.5">Contraseña</label>
                            <input
                                type="password"
                                id="contrasena"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-cafe-400 focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:border-transparent transition-all text-sm"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-200 text-xs rounded-xl p-3">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full mt-6 bg-cafe-500 hover:bg-cafe-400 disabled:bg-cafe-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-cafe-500/25 flex items-center justify-center gap-2"
                    >
                        {cargando ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Acceder al Panel'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
