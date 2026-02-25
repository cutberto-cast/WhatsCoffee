'use client';

import { useState } from 'react';

interface BarraBusquedaProps {
    onBuscar: (termino: string) => void;
    disabled?: boolean;
}

export function BarraBusqueda({ onBuscar, disabled }: BarraBusquedaProps) {
    const [termino, setTermino] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setTermino(valor);
        onBuscar(valor);
    };

    const handleLimpiar = () => {
        setTermino('');
        onBuscar('');
    };

    return (
        <div className={`relative w-full ${disabled ? 'opacity-50' : ''}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-cafe-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                value={termino}
                onChange={handleChange}
                placeholder="Buscar productos..."
                disabled={disabled}
                className={`w-full pl-9 pr-8 py-1.5 bg-white rounded-lg border border-cafe-200 text-cafe-800 placeholder:text-cafe-300 focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:border-transparent transition-all text-sm ${disabled ? 'cursor-not-allowed' : ''}`}
                aria-label="Buscar productos"
            />
            {termino && (
                <button
                    onClick={handleLimpiar}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-cafe-400 hover:text-cafe-600"
                    aria-label="Limpiar búsqueda"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}