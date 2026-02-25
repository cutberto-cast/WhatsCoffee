'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { BannerHero } from '@/components/menu/BannerHero';
import { CategoriasNav } from '@/components/menu/CategoriasNav';
import { ProductoCard } from '@/components/menu/ProductoCard';
import { ProductoDetalle } from '@/components/menu/ProductoDetalle';
import { BarraNavegacion } from '@/components/menu/BarraNavegacion';
import { BarraBusqueda } from '@/components/menu/BarraBusqueda';
import { CarritoVista } from '@/components/carrito/CarritoVista';
import { CheckoutVista } from '@/components/carrito/CheckoutVista';
import { createClient } from '@/lib/supabase/client';
import type { Producto, Categoria, Banner } from '@/types';

type Vista = 'home' | 'carrito' | 'checkout';

export default function HomePage() {
  const [vista, setVista] = useState<Vista>('home');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerProductos, setBannerProductos] = useState<Record<string, string[]>>({});
  const [bannerFiltroActivo, setBannerFiltroActivo] = useState<string | null>(null);
  const [nombreNegocio, setNombreNegocio] = useState('Nube Alta Cafe');
  const [cargando, setCargando] = useState(true);

  const supabase = createClient();

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    const [resCat, resProd, resBan, resConf, resBanProd] = await Promise.all([
      supabase.from('categorias').select('*').order('orden'),
      supabase.from('productos').select('*').order('creado_en', { ascending: false }),
      supabase.from('banners').select('*').order('orden'),
      supabase.from('configuracion').select('*').limit(1).single(),
      supabase.from('banner_productos').select('*')
    ]);

    if (resCat.data) setCategorias(resCat.data);
    if (resProd.data) setProductos(resProd.data);
    if (resBan.data) setBanners(resBan.data);
    if (resConf.data) setNombreNegocio(resConf.data.nombre_negocio);
    if (resBanProd.data) {
      const bp: Record<string, string[]> = {};
      (resBanProd.data || []).forEach((row: any) => {
        if (!bp[row.banner_id]) bp[row.banner_id] = [];
        bp[row.banner_id]!.push(row.producto_id);
      });
      setBannerProductos(bp);
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    const channel = supabase
      .channel('cambios-publicos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => {
        cargarDatos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        cargarDatos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, () => {
        cargarDatos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cargarDatos, supabase]);

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideCategoria =
        categoriaActiva === null || producto.categoria_id === categoriaActiva;
      const coincideBusqueda =
        terminoBusqueda === '' ||
        producto.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase());
      const coincideBanner =
        bannerFiltroActivo === null || (bannerProductos[bannerFiltroActivo] || []).includes(producto.id);

      return coincideCategoria && coincideBusqueda && coincideBanner;
    });
  }, [categoriaActiva, terminoBusqueda, productos, bannerFiltroActivo, bannerProductos]);

  const handleNavegar = (nuevaVista: Vista) => {
    setVista(nuevaVista);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-cafe-300 border-t-cafe-600 rounded-full animate-spin" />
        <p className="text-cafe-400 text-sm">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-lg mx-auto px-4">
        {/* HEADER SIEMPRE VISIBLE */}
        <header className={`flex flex-col gap-2 relative bg-[#4A2C2A] px-4 pt-3 shadow-xl -mx-4 sm:mx-0 sm:rounded-b-3xl sm:rounded-none rounded-b-3xl mb-5 ${vista === 'home' ? 'pb-4' : 'pb-3'}`}>
          <div className="flex items-center justify-between z-10 relative w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{nombreNegocio}</h1>
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 bg-white rounded-full shadow-sm overflow-hidden flex items-center justify-center">
              <Image
                src="/images/nubelogo.png"
                alt="Nube Alta Cafe"
                fill
                className="object-contain p-1.5"
              />
            </div>
          </div>
          {vista === 'home' && (
            <div className="w-full z-10 relative">
              <BarraBusqueda onBuscar={setTerminoBusqueda} />
            </div>
          )}
        </header>

        {vista === 'home' && (
          <div className="space-y-5 animate-fade-in">

            <BannerHero
              banners={banners}
              onBannerClick={(bannerId: string) => {
                const vinculados = bannerProductos[bannerId];
                if (vinculados && vinculados.length > 0) {
                  setBannerFiltroActivo(bannerId);
                  setCategoriaActiva(null);
                  const categoriesSection = document.getElementById('categorias-section');
                  if (categoriesSection) categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            />

            <section id="categorias-section">
              <h2 className="text-lg font-bold text-cafe-900 mb-3">Categorías</h2>
              <CategoriasNav categorias={categorias} categoriaActiva={categoriaActiva} onSeleccionar={(cat) => {
                setCategoriaActiva(cat);
                setBannerFiltroActivo(null);
              }} />
            </section>

            <section>
              {bannerFiltroActivo && (
                <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl mb-4 border border-amber-200 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-800 text-sm font-semibold">Mostrando promoción</span>
                  </div>
                  <button onClick={() => setBannerFiltroActivo(null)} className="text-amber-700 hover:text-amber-900 font-medium text-sm px-3 py-1 bg-amber-100 rounded-lg">Quitar</button>
                </div>
              )}

              {(() => {
                const mostrarAgrupadoPorCategoria = categoriaActiva === null && bannerFiltroActivo === null && !terminoBusqueda;

                if (mostrarAgrupadoPorCategoria) {
                  return (
                    <>
                      {categorias.map((categoria) => {
                        const productosDeCategoria = productos
                          .filter(p => p.categoria_id === categoria.id && p.esta_disponible);

                        if (productosDeCategoria.length === 0) return null;

                        const mostrarVerMas = productosDeCategoria.length > 4;
                        const productosAMostrar = productosDeCategoria.slice(0, 4);

                        return (
                          <section key={categoria.id} className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <h2 className="text-lg font-bold text-cafe-900 sm:text-xl">
                                {categoria.nombre}
                              </h2>
                              {mostrarVerMas && (
                                <button
                                  onClick={() => {
                                    setCategoriaActiva(categoria.id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="text-sm font-semibold text-[#4A2C2A] hover:underline"
                                >
                                  Ver más
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              {productosAMostrar.map((producto) => (
                                <ProductoCard
                                  key={producto.id}
                                  producto={producto}
                                  onVerDetalle={setProductoDetalle}
                                />
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </>
                  );
                }

                return (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold text-cafe-900">
                        {bannerFiltroActivo
                          ? 'Ofertas del banner'
                          : categoriaActiva
                            ? categorias.find((c) => c.id === categoriaActiva)?.nombre ?? 'Productos'
                            : 'Todos los Productos'}
                      </h2>
                      <span className="text-xs text-cafe-400">{productosFiltrados.length} productos</span>
                    </div>
                    {productosFiltrados.length === 0 ? (
                      <div className="text-center py-12"><p className="text-cafe-400 text-sm">No se encontraron productos</p></div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {productosFiltrados.map((producto) => (
                          <ProductoCard key={producto.id} producto={producto} onVerDetalle={setProductoDetalle} />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </section>
          </div>
        )}

        {vista === 'carrito' && (
          <CarritoVista onIrCheckout={() => handleNavegar('checkout')} onSeguirComprando={() => handleNavegar('home')} />
        )}

        {vista === 'checkout' && (
          <CheckoutVista onVolver={() => handleNavegar('carrito')} />
        )}
      </div>

      <BarraNavegacion vistaActual={vista} onNavegar={handleNavegar} />

      {productoDetalle && (
        <ProductoDetalle producto={productoDetalle} onCerrar={() => setProductoDetalle(null)} />
      )}
    </div>
  );
}