'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CarritoItem, Producto } from '@/types';

interface CarritoStore {
    items: CarritoItem[];
    agregar: (producto: Producto) => void;
    eliminar: (productoId: string) => void;
    actualizarCantidad: (productoId: string, cantidad: number) => void;
    limpiar: () => void;
    totalItems: () => number;
    totalPrecio: () => number;
}

export const useCarrito = create<CarritoStore>()(
    persist(
        (set, get) => ({
            items: [],

            agregar: (producto: Producto) => {
                set((state) => {
                    const existente = state.items.find(
                        (item) => item.producto.id === producto.id
                    );
                    if (existente) {
                        return {
                            items: state.items.map((item) =>
                                item.producto.id === producto.id
                                    ? { ...item, cantidad: item.cantidad + 1 }
                                    : item
                            ),
                        };
                    }
                    return { items: [...state.items, { producto, cantidad: 1 }] };
                });
            },

            eliminar: (productoId: string) => {
                set((state) => ({
                    items: state.items.filter((item) => item.producto.id !== productoId),
                }));
            },

            actualizarCantidad: (productoId: string, cantidad: number) => {
                if (cantidad <= 0) {
                    get().eliminar(productoId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.producto.id === productoId ? { ...item, cantidad } : item
                    ),
                }));
            },

            limpiar: () => set({ items: [] }),

            totalItems: () => {
                return get().items.reduce((acc, item) => acc + item.cantidad, 0);
            },

            totalPrecio: () => {
                return get().items.reduce(
                    (acc, item) => acc + item.producto.precio * item.cantidad,
                    0
                );
            },
        }),
        { name: 'nube-alta-cafe-carrito' }
    )
);
