'use client';

import type { Categoria } from '@/types';

interface CategoriasNavProps {
    categorias: Categoria[];
    categoriaActiva: string | null;
    onSeleccionar: (categoriaId: string | null) => void;
}

export function CategoriasNav({
    categorias,
    categoriaActiva,
    onSeleccionar,
}: CategoriasNavProps) {
    return (
        <nav className="w-full" aria-label="Categorías del menú">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 py-1 px-0.5">
                {/* Botón "Todos" */}
                <button
                    onClick={() => onSeleccionar(null)}
                    className={`h-12 p-2 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 ${categoriaActiva === null
                        ? 'bg-[#4A2C2A] text-white shadow-lg'
                        : 'bg-white text-cafe-700 hover:bg-cafe-100 border border-cafe-200'
                        }`}
                    aria-pressed={categoriaActiva === null}
                >
                    Todos
                </button>

                {categorias.map((categoria) => (
                    <button
                        key={categoria.id}
                        onClick={() => onSeleccionar(categoria.id)}
                        className={`h-12 p-2 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 text-center ${categoriaActiva === categoria.id
                            ? 'bg-[#4A2C2A] text-white shadow-lg'
                            : 'bg-white text-cafe-700 hover:bg-cafe-100 border border-cafe-200'
                            }`}
                        aria-pressed={categoriaActiva === categoria.id}
                    >
                        {categoria.nombre}
                    </button>
                ))}
            </div>
        </nav>
    );
}
