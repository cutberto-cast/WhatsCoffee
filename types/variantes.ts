// Tipos auxiliares para variantes y toppings con relaciones

import type { Variante, Topping } from '@/types';

export interface GrupoConVariantes {
    id: string;
    producto_id: string;
    nombre: string;
    variantes: Variante[];
}

export interface ProductoConToppings {
    id: string;
    producto_id: string;
    topping_id: string;
    toppings: Topping;
}
