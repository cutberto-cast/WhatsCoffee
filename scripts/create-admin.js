import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Idealmente usaríamos service_role para esto, pero anon con signUp funciona si está habilitado

const supabase = createClient(supabaseUrl, supabaseKey);

async function crearAdmin() {
    const { data, error } = await supabase.auth.signUp({
        email: 'admin@cafeorder.com',
        password: 'admin123',
    });

    if (error) {
        console.error('Error creando admin:', error.message);
    } else {
        console.log('Usuario admin creado exitosamente:', data.user?.email);
    }
}

crearAdmin();
