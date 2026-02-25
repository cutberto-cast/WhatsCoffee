'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Producto, Categoria, Banner } from '@/types';
import { PRODUCTOS_MOCK, CATEGORIAS_MOCK, BANNERS_MOCK, CONFIGURACION_MOCK } from '@/lib/data/mock';

interface AdminAuthStore {
    estaAutenticado: boolean;
    email: string | null;
    iniciarSesion: (email: string, contrasena: string) => boolean;
    cerrarSesion: () => void;
}

export const useAdminAuth = create<AdminAuthStore>()(
    persist(
        (set) => ({
            estaAutenticado: false,
            email: null,

            iniciarSesion: (email: string, contrasena: string) => {
                // Mock auth — en producción usar Supabase Auth
                if (email === 'admin@cafeorder.com' && contrasena === 'admin123') {
                    set({ estaAutenticado: true, email });
                    return true;
                }
                return false;
            },

            cerrarSesion: () => {
                set({ estaAutenticado: false, email: null });
            },
        }),
        { name: 'cafeorder-admin-auth' }
    )
);

// --- Store de datos del admin ---
interface ConfiguracionNegocio {
    nombre_negocio: string;
    telefono_whatsapp: string;
    logo_url: string;
    color_primario: string;
}

interface AdminDataStore {
    productos: Producto[];
    categorias: Categoria[];
    banners: Banner[];
    configuracion: ConfiguracionNegocio;

    // Productos
    agregarProducto: (producto: Omit<Producto, 'id' | 'creado_en' | 'actualizado_en'>) => void;
    editarProducto: (id: string, datos: Partial<Producto>) => void;
    eliminarProducto: (id: string) => void;
    toggleDisponibilidad: (id: string) => void;

    // Categorías
    agregarCategoria: (categoria: Omit<Categoria, 'id' | 'creado_en'>) => void;
    editarCategoria: (id: string, datos: Partial<Categoria>) => void;
    eliminarCategoria: (id: string) => void;

    // Banners
    agregarBanner: (banner: Omit<Banner, 'id' | 'creado_en'>) => void;
    editarBanner: (id: string, datos: Partial<Banner>) => void;
    eliminarBanner: (id: string) => void;
    toggleBannerActivo: (id: string) => void;

    // Configuración
    actualizarConfiguracion: (datos: Partial<ConfiguracionNegocio>) => void;
}

function generarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useAdminData = create<AdminDataStore>()(
    persist(
        (set) => ({
            productos: PRODUCTOS_MOCK,
            categorias: CATEGORIAS_MOCK,
            banners: BANNERS_MOCK,
            configuracion: CONFIGURACION_MOCK,

            // --- Productos ---
            agregarProducto: (producto) => {
                const nuevo: Producto = {
                    ...producto,
                    id: generarId(),
                    creado_en: new Date().toISOString(),
                    actualizado_en: new Date().toISOString(),
                };
                set((state) => ({ productos: [...state.productos, nuevo] }));
            },

            editarProducto: (id, datos) => {
                set((state) => ({
                    productos: state.productos.map((p) =>
                        p.id === id
                            ? { ...p, ...datos, actualizado_en: new Date().toISOString() }
                            : p
                    ),
                }));
            },

            eliminarProducto: (id) => {
                set((state) => ({
                    productos: state.productos.filter((p) => p.id !== id),
                }));
            },

            toggleDisponibilidad: (id) => {
                set((state) => ({
                    productos: state.productos.map((p) =>
                        p.id === id
                            ? { ...p, esta_disponible: !p.esta_disponible, actualizado_en: new Date().toISOString() }
                            : p
                    ),
                }));
            },

            // --- Categorías ---
            agregarCategoria: (categoria) => {
                const nueva: Categoria = {
                    ...categoria,
                    id: generarId(),
                    creado_en: new Date().toISOString(),
                };
                set((state) => ({ categorias: [...state.categorias, nueva] }));
            },

            editarCategoria: (id, datos) => {
                set((state) => ({
                    categorias: state.categorias.map((c) =>
                        c.id === id ? { ...c, ...datos } : c
                    ),
                }));
            },

            eliminarCategoria: (id) => {
                set((state) => ({
                    categorias: state.categorias.filter((c) => c.id !== id),
                }));
            },

            // --- Banners ---
            agregarBanner: (banner) => {
                const nuevo: Banner = {
                    ...banner,
                    id: generarId(),
                    creado_en: new Date().toISOString(),
                };
                set((state) => ({ banners: [...state.banners, nuevo] }));
            },

            editarBanner: (id, datos) => {
                set((state) => ({
                    banners: state.banners.map((b) =>
                        b.id === id ? { ...b, ...datos } : b
                    ),
                }));
            },

            eliminarBanner: (id) => {
                set((state) => ({
                    banners: state.banners.filter((b) => b.id !== id),
                }));
            },

            toggleBannerActivo: (id) => {
                set((state) => ({
                    banners: state.banners.map((b) =>
                        b.id === id ? { ...b, activo: !b.activo } : b
                    ),
                }));
            },

            // --- Configuración ---
            actualizarConfiguracion: (datos) => {
                set((state) => ({
                    configuracion: { ...state.configuracion, ...datos },
                }));
            },
        }),
        { name: 'cafeorder-admin-data' }
    )
);
