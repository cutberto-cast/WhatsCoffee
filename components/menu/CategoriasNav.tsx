'use client';

import { useState, useEffect } from 'react';
import type { Categoria, MacroCategoria } from '@/types';
import { MACRO_CATEGORIAS_CONFIG } from '@/types';

interface CategoriasNavProps {
    categorias: Categoria[];
    macroActiva: MacroCategoria | null;
    onSeleccionar: (macro: MacroCategoria | null) => void;
}

export function CategoriasNav({
    categorias,
    macroActiva,
    onSeleccionar,
}: CategoriasNavProps) {
    // Estado para saber si el usuario ha hecho scroll
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Si baja más de 50px, activamos la vista de píldoras
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Solo mostrar macros que tienen al menos una categoría en BD
    const macrosDisponibles = MACRO_CATEGORIAS_CONFIG.filter(
        macro => categorias.some(c => c.macro_categoria === macro.id)
    );

    return (
        <nav className="w-full" aria-label="Categorías del menú">
            <div
                className={`transition-all duration-300 ${isScrolled
                    ? 'flex overflow-x-auto gap-2 pb-1 items-center scrollbar-hide' // Estilo horizontal deslizable
                    : 'grid gap-2 py-1' // Estilo cuadrícula original
                    }`}
                style={!isScrolled ? { gridTemplateColumns: 'repeat(5, 1fr)' } : {}}
            >
                {/* Botón Todos */}
                <button
                    onClick={() => onSeleccionar(null)}
                    className={`flex items-center justify-center transition-all duration-200 border-2 ${isScrolled
                        ? 'flex-row rounded-full px-3 py-1.5 flex-shrink-0 gap-1.5' // Modo "píldora" (como tu imagen)
                        : 'flex-col aspect-square p-1 rounded-xl gap-1' // Modo "cuadrado" original
                        } ${macroActiva === null
                            ? 'border-[var(--color-primario)] bg-[var(--color-primario)] text-white'
                            // Usé bg-gray-100 para acercarme más al gris clarito de tu imagen
                            : 'border-transparent bg-gray-100 text-gray-800 hover:border-gray-300'
                        }`}
                    aria-pressed={macroActiva === null}
                >
                    <span className={isScrolled ? "text-base" : "text-lg"}>🏠</span>
                    <span className={`${isScrolled ? "text-sm" : "text-[10px] text-center"} font-semibold leading-tight`}>
                        Todos
                    </span>
                </button>

                {/* Botones de macro-categorías */}
                {macrosDisponibles.map((macro) => (
                    <button
                        key={macro.id}
                        onClick={() => onSeleccionar(macro.id)}
                        className={`flex items-center justify-center transition-all duration-200 border-2 ${isScrolled
                            ? 'flex-row rounded-full px-3 py-1.5 flex-shrink-0 gap-1.5' // Modo "píldora"
                            : 'flex-col aspect-square p-1 rounded-xl gap-1' // Modo "cuadrado"
                            } ${macroActiva === macro.id
                                ? 'border-[var(--color-primario)] bg-[var(--color-primario)] text-white'
                                : 'border-transparent bg-gray-100 text-gray-800 hover:border-gray-300'
                            }`}
                        aria-pressed={macroActiva === macro.id}
                    >
                        <span className={isScrolled ? "text-base" : "text-lg"}>{macro.icono}</span>
                        <span className={`${isScrolled ? "text-sm" : "text-[10px] text-center"} font-semibold leading-tight`}>
                            {macro.nombre}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    );
}