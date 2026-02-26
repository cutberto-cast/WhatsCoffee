'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Producto } from '@/types';
import { formatearPrecio } from '@/lib/utils/formatearPrecio';
import { useCarrito } from '@/stores/carritoStore';

interface ProductoDetalleProps {
    producto: Producto;
    onCerrar: () => void;
}

export function ProductoDetalle({ producto, onCerrar }: ProductoDetalleProps) {
    const [cantidad, setCantidad] = useState(1);
    const agregarSimple = useCarrito((state) => state.agregarSimple);

    const handleAgregar = () => {
        if (!producto.esta_disponible) return;
        for (let i = 0; i < cantidad; i++) {
            agregarSimple(producto);
        }
        onCerrar();
    };

    const incrementar = () => setCantidad((prev) => Math.min(prev + 1, 20));
    const decrementar = () => setCantidad((prev) => Math.max(prev - 1, 1));

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de ${producto.nombre}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onCerrar}
            />

            {/* Modal */}
            <div className="relative bg-crema-50 w-full sm:w-[480px] sm:max-h-[90vh] max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up shadow-2xl flex flex-col">
                {/* Imagen grande */}
                <div className="relative h-64 sm:h-72 bg-cafe-100 flex-shrink-0">
                    <Image
                        src={producto.imagen_url}
                        alt={`Foto de ${producto.nombre}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 480px"
                        priority
                    />
                    <button
                        onClick={onCerrar}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                        aria-label="Cerrar detalle"
                    >
                        <svg className="w-5 h-5 text-cafe-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {!producto.esta_disponible && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            No disponible
                        </div>
                    )}
                </div>

                {/* Contenido */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-cafe-900">
                        {producto.nombre}
                    </h2>
                    <p className="text-cafe-600 text-sm mt-2 leading-relaxed">
                        {producto.descripcion}
                    </p>

                    {/* Precio y selector de cantidad */}
                    <div className="flex items-center justify-between mt-6">
                        <span className="text-2xl font-bold text-cafe-700">
                            {producto.tiene_variantes
                                ? 'Configurable'
                                : formatearPrecio(producto.precio ?? 0)}
                        </span>

                        {producto.esta_disponible && (
                            <div className="flex items-center gap-3 bg-cafe-100 rounded-full px-2 py-1">
                                <button
                                    onClick={decrementar}
                                    className="w-9 h-9 rounded-full bg-white text-cafe-700 flex items-center justify-center font-bold text-lg hover:bg-cafe-200 active:scale-90 transition-all shadow-sm"
                                    aria-label="Reducir cantidad"
                                >
                                    −
                                </button>
                                <span className="text-cafe-800 font-semibold text-lg w-6 text-center">
                                    {cantidad}
                                </span>
                                <button
                                    onClick={incrementar}
                                    className="w-9 h-9 rounded-full bg-white text-cafe-700 flex items-center justify-center font-bold text-lg hover:bg-cafe-200 active:scale-90 transition-all shadow-sm"
                                    aria-label="Aumentar cantidad"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botón de agregar */}
                {producto.esta_disponible && (
                    <div className="p-6 pt-0 flex-shrink-0">
                        <button
                            onClick={handleAgregar}
                            className="w-full bg-cafe-700 hover:bg-cafe-800 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-cafe-700/25 text-base"
                        >
                            Agregar al Carrito — {formatearPrecio((producto.precio ?? 0) * cantidad)}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
