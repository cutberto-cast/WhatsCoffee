// Tipos del dominio Nube Alta Cafe

export interface Categoria {
    id: string;
    nombre: string;
    icono?: string | null;
    orden: number;
    creado_en: string;
}

export interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen_url: string;
    categoria_id: string;
    esta_disponible: boolean;
    creado_en: string;
    actualizado_en: string;
}

export interface Banner {
    id: string;
    titulo: string;
    descripcion: string;
    imagen_url: string;
    imagen_fondo_completo_url?: string | null;
    fondo_seleccionado?: 'fondo1' | 'fondo2' | null;
    activo: boolean;
    orden: number;
    creado_en: string;
}

export interface Promocion {
    id: string;
    titulo: string;
    descripcion: string;
    imagen_url: string;
    activo: boolean;
    fecha_inicio: string;
    fecha_fin: string;
}

export interface Configuracion {
    id: string;
    nombre_negocio: string;
    telefono_whatsapp: string;
    logo_url: string;
    color_primario: string;
}

export interface CarritoItem {
    producto: Producto;
    cantidad: number;
}

export interface DatosPedido {
    nombre_cliente: string;
    direccion: string;
    forma_pago: 'efectivo' | 'transferencia';
    notas?: string;
}
