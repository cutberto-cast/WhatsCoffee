'use client';

import { useCarrito } from '@/stores/carritoStore';
import { useEffect, useState } from 'react';

interface BarraNavegacionProps {
    vistaActual: 'home' | 'carrito' | 'checkout';
    onNavegar: (vista: 'home' | 'carrito' | 'checkout') => void;
}

export function BarraNavegacion({ vistaActual, onNavegar }: BarraNavegacionProps) {
    const totalItems = useCarrito((state) => state.totalItems);
    const [contadorItems, setContadorItems] = useState(0);

    // Evitar hydration mismatch con Zustand persist
    useEffect(() => {
        setContadorItems(totalItems());
    }, [totalItems]);

    // Suscribirse a cambios del store
    useEffect(() => {
        const unsub = useCarrito.subscribe(() => {
            setContadorItems(useCarrito.getState().totalItems());
        });
        return unsub;
    }, []);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-cafe-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" aria-label="Navegación principal">
            <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
                {/* Home */}
                <button
                    onClick={() => onNavegar('home')}
                    className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all ${vistaActual === 'home'
                            ? 'bg-cafe-100 text-cafe-700'
                            : 'text-cafe-400 hover:text-cafe-600'
                        }`}
                    aria-label="Inicio"
                    aria-current={vistaActual === 'home' ? 'page' : undefined}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={vistaActual === 'home' ? 2.5 : 1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-[10px] font-medium">Inicio</span>
                </button>

                {/* Carrito */}
                <button
                    onClick={() => onNavegar('carrito')}
                    className={`relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all ${vistaActual === 'carrito'
                            ? 'bg-cafe-100 text-cafe-700'
                            : 'text-cafe-400 hover:text-cafe-600'
                        }`}
                    aria-label={`Carrito con ${contadorItems} productos`}
                    aria-current={vistaActual === 'carrito' ? 'page' : undefined}
                >
                    <div className="relative">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={vistaActual === 'carrito' ? 2.5 : 1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                        {contadorItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                                {contadorItems > 9 ? '9+' : contadorItems}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">Carrito</span>
                </button>

                {/* Pedido/Checkout */}
                <button
                    onClick={() => onNavegar('checkout')}
                    className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all ${vistaActual === 'checkout'
                            ? 'bg-cafe-100 text-cafe-700'
                            : 'text-cafe-400 hover:text-cafe-600'
                        }`}
                    aria-label="Hacer pedido"
                    aria-current={vistaActual === 'checkout' ? 'page' : undefined}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={vistaActual === 'checkout' ? 2.5 : 1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="text-[10px] font-medium">Pedido</span>
                </button>
            </div>
        </nav>
    );
}
