/* import type { Categoria, Producto, Banner } from '@/types';

// Imágenes de ejemplo de Unsplash (café/cafetería)
export const CATEGORIAS_MOCK: Categoria[] = [
    {
        id: 'cat-1',
        nombre: 'Cafés Calientes',
        orden: 1,
        creado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'cat-2',
        nombre: 'Frappes',
        orden: 2,
        creado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'cat-3',
        nombre: 'Postres',
        orden: 3,
        creado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'cat-4',
        nombre: 'Bebidas Frías',
        orden: 4,
        creado_en: '2025-01-01T00:00:00Z',
    },
];

export const PRODUCTOS_MOCK: Producto[] = [
    {
        id: 'prod-1',
        nombre: 'Cappuccino Clásico',
        descripcion:
            'Espresso con leche vaporizada y espuma cremosa. Nuestro clásico favorito preparado con granos arábica seleccionados.',
        precio: 65,
        imagen_url:
            'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
        categoria_id: 'cat-1',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-2',
        nombre: 'Latte Vainilla',
        descripcion:
            'Café espresso con leche al vapor y un toque de vainilla natural. Suave y aromático.',
        precio: 75,
        imagen_url:
            'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
        categoria_id: 'cat-1',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-3',
        nombre: 'Americano',
        descripcion:
            'Espresso doble con agua caliente. Intenso y con cuerpo, ideal para los amantes del café puro.',
        precio: 45,
        imagen_url:
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=400&fit=crop',
        categoria_id: 'cat-1',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-4',
        nombre: 'Mocha',
        descripcion:
            'Espresso, chocolate premium y leche vaporizada coronado con crema batida.',
        precio: 80,
        imagen_url:
            'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=400&fit=crop',
        categoria_id: 'cat-1',
        esta_disponible: false,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-5',
        nombre: 'Frappé Caramelo',
        descripcion:
            'Café frappé con salsa de caramelo, hielo frappe, leche y crema batida. Refrescante y dulce.',
        precio: 89,
        imagen_url:
            'https://images.unsplash.com/photo-1461596830242-923bb90b2c27?w=400&h=400&fit=crop',
        categoria_id: 'cat-2',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-6',
        nombre: 'Frappé Mocha',
        descripcion:
            'Mezcla helada de café, chocolate y leche con crema batida. Indulgente y refrescante.',
        precio: 95,
        imagen_url:
            'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=400&fit=crop',
        categoria_id: 'cat-2',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-7',
        nombre: 'Frappé Cookies & Cream',
        descripcion:
            'Frappé cremoso con galleta oreo, leche y crema batida. Un postre hecho bebida.',
        precio: 99,
        imagen_url:
            'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop',
        categoria_id: 'cat-2',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-8',
        nombre: 'Cheesecake de Frutos Rojos',
        descripcion:
            'Tarta cremosa de queso con coulis de frutos rojos sobre base de galleta. Porción individual.',
        precio: 75,
        imagen_url:
            'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop',
        categoria_id: 'cat-3',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-9',
        nombre: 'Brownie con Helado',
        descripcion:
            'Brownie de chocolate caliente acompañado de una bola de helado de vainilla y salsa de chocolate.',
        precio: 85,
        imagen_url:
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop',
        categoria_id: 'cat-3',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-10',
        nombre: 'Limonada de la Casa',
        descripcion:
            'Limonada natural con hierbabuena y un toque de jengibre. Refrescante y revitalizante.',
        precio: 45,
        imagen_url:
            'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop',
        categoria_id: 'cat-4',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-11',
        nombre: 'Té Chai Latte',
        descripcion:
            'Té negro con especias aromáticas y leche vaporizada. Cálido y reconfortante.',
        precio: 60,
        imagen_url:
            'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=400&fit=crop',
        categoria_id: 'cat-1',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'prod-12',
        nombre: 'Smoothie de Mango',
        descripcion:
            'Smoothie tropical con mango fresco, yogurt natural y miel. Nutritivo y delicioso.',
        precio: 70,
        imagen_url:
            'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop',
        categoria_id: 'cat-4',
        esta_disponible: true,
        creado_en: '2025-01-01T00:00:00Z',
        actualizado_en: '2025-01-01T00:00:00Z',
    },
];

export const BANNERS_MOCK: Banner[] = [
    {
        id: 'banner-1',
        titulo: '50% OFF',
        descripcion: 'Super Descuento - Solo Hoy',
        imagen_url:
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop',
        activo: true,
        orden: 1,
        creado_en: '2025-01-01T00:00:00Z',
    },
    {
        id: 'banner-2',
        titulo: 'Nuevos Frappes',
        descripcion: 'Descubre nuestra nueva línea de frappes para el verano',
        imagen_url:
            'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=400&fit=crop',
        activo: true,
        orden: 2,
        creado_en: '2025-01-01T00:00:00Z',
    },
];

export const CONFIGURACION_MOCK = {
    id: 'config-1',
    nombre_negocio: 'Nube Alta Cafe',
    telefono_whatsapp: '522722815138',
    logo_url: '',
    color_primario: '#C68B59',
};
 */