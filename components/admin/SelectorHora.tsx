'use client';

import { useState, useRef, useEffect } from 'react';

interface SelectorHoraProps {
    valor: string; // "08:00" en formato 24h
    onCambiar: (hora: string) => void;
}

function formatear12h(hora24: string): string {
    const [h = 0, m = 0] = hora24.split(':').map(Number);
    const sufijo = h < 12 ? 'a.m.' : 'p.m.';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

// Opciones cada 30 minutos (00:00, 00:30, ... 23:30)
const OPCIONES_BASE: string[] = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
});

export function SelectorHora({ valor, onCambiar }: SelectorHoraProps) {
    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef<HTMLDivElement>(null);
    const opcionActivaRef = useRef<HTMLButtonElement>(null);

    // Si el valor guardado no está en los pasos de 30 min (ej. 08:15), se muestra igual
    const opciones = OPCIONES_BASE.includes(valor)
        ? OPCIONES_BASE
        : [...OPCIONES_BASE, valor].sort();

    useEffect(() => {
        if (!abierto) return;

        opcionActivaRef.current?.scrollIntoView({ block: 'center' });

        const cerrarSiClickFuera = (e: MouseEvent) => {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
                setAbierto(false);
            }
        };
        const cerrarConEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setAbierto(false);
        };

        document.addEventListener('mousedown', cerrarSiClickFuera);
        document.addEventListener('keydown', cerrarConEscape);
        return () => {
            document.removeEventListener('mousedown', cerrarSiClickFuera);
            document.removeEventListener('keydown', cerrarConEscape);
        };
    }, [abierto]);

    return (
        <div ref={contenedorRef} className="relative">
            <button
                type="button"
                onClick={() => setAbierto(!abierto)}
                className={`inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-2 bg-white border rounded-xl text-[13px] font-medium text-[var(--color-texto-1)] shadow-sm transition-all ${abierto ? 'border-[var(--color-acento)] ring-2 ring-[var(--color-acento)]/15' : 'border-[var(--color-borde)] hover:border-[var(--color-texto-3)]'}`}
            >
                {formatear12h(valor)}
                <svg
                    className={`w-3.5 h-3.5 text-[var(--color-texto-3)] transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {abierto && (
                <div className="absolute z-50 mt-2 left-0 w-40 max-h-52 overflow-y-auto bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-xl shadow-black/10 py-1.5 px-1.5 animate-scale-in origin-top">
                    {opciones.map((opcion) => {
                        const activa = opcion === valor;
                        return (
                            <button
                                key={opcion}
                                ref={activa ? opcionActivaRef : null}
                                type="button"
                                onClick={() => {
                                    onCambiar(opcion);
                                    setAbierto(false);
                                }}
                                className={`w-full flex items-center justify-between text-left px-3 py-2 text-[13px] rounded-xl transition-colors ${activa ? 'bg-[var(--color-acento)] text-white font-semibold' : 'text-[var(--color-texto-1)] hover:bg-black/[0.04]'}`}
                            >
                                {formatear12h(opcion)}
                                {activa && (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
