'use client';

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
    // Solo mostrar macros que tienen al menos una categoría en BD
    const macrosDisponibles = MACRO_CATEGORIAS_CONFIG.filter(
        macro => categorias.some(c => c.macro_categoria === macro.id)
    );

    return (
        <nav className="w-full" aria-label="Categorías del menú">
            <div className="grid gap-2 py-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {/* Botón Todos */}
                <button
                    onClick={() => onSeleccionar(null)}
                    className={`flex flex-col items-center justify-center gap-1 aspect-square p-1 rounded-xl border-2 transition-all ${macroActiva === null
                        ? 'border-[var(--color-primario)] bg-[var(--color-primario)] text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-cafe-300'
                        }`}
                    aria-pressed={macroActiva === null}
                >
                    <span className="text-lg">🏠</span>
                    <span className="text-[10px] font-semibold leading-tight text-center">
                        Todos
                    </span>
                </button>

                {/* Botones de macro-categorías */}
                {macrosDisponibles.map((macro) => (
                    <button
                        key={macro.id}
                        onClick={() => onSeleccionar(macro.id)}
                        className={`flex flex-col items-center justify-center gap-1 aspect-square p-1 rounded-xl border-2 transition-all ${macroActiva === macro.id
                            ? 'border-[var(--color-primario)] bg-[var(--color-primario)] text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-cafe-300'
                            }`}
                        aria-pressed={macroActiva === macro.id}
                    >
                        <span className="text-lg">{macro.icono}</span>
                        <span className="text-[10px] font-semibold leading-tight text-center">
                            {macro.nombre}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    );
}