'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Banner } from '@/types';

interface BannerHeroProps {
    banners: Banner[];
    onBannerClick?: (bannerId: string) => void;
}

export function BannerHero({ banners, onBannerClick }: BannerHeroProps) {
    const [indiceActual, setIndiceActual] = useState(0);
    const [pausado, setPausado] = useState(false);
    const bannersActivos = banners.filter((b) => b.activo);

    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    const siguiente = useCallback(() => {
        setIndiceActual((prev) => (prev + 1) % bannersActivos.length);
    }, [bannersActivos.length]);

    const anterior = useCallback(() => {
        setIndiceActual((prev) => prev === 0 ? bannersActivos.length - 1 : prev - 1);
    }, [bannersActivos.length]);

    useEffect(() => {
        if (bannersActivos.length <= 1 || pausado) return;

        const interval = setInterval(() => {
            siguiente();
        }, 4000);

        return () => clearInterval(interval);
    }, [bannersActivos.length, pausado, siguiente]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!e.touches[0]) return;
        touchStartX.current = e.touches[0].clientX;
        setPausado(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!e.touches[0]) return;
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (diff > 50) {
            siguiente();
        } else if (diff < -50) {
            anterior();
        }
        setTimeout(() => setPausado(false), 3000);
    };

    if (bannersActivos.length === 0) return null;

    return (
        <div
            className="relative w-full rounded-2xl overflow-hidden h-36 sm:h-40 md:h-44"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${indiceActual * 100}%)` }}
            >
                {bannersActivos.map((banner, i) => {
                    const isFullImage = !!banner.imagen_fondo_completo_url;
                    const bgImage = isFullImage
                        ? banner.imagen_fondo_completo_url
                        : `/images/fondos/${banner.fondo_seleccionado || 'fondo1'}.jpg`;

                    return (
                        <div
                            key={banner.id}
                            onClick={() => onBannerClick?.(banner.id)}
                            className={`w-full h-full flex-shrink-0 relative ${onBannerClick ? 'cursor-pointer' : ''}`}
                            style={{
                                backgroundImage: `url(${bgImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {isFullImage ? (
                                /* Modo Banner Completo Personalizado */
                                <div className="absolute inset-0 flex flex-col justify-center p-6">
                                    {(banner.titulo || banner.descripcion) && (
                                        <div className="max-w-[70%] drop-shadow-md">
                                            {banner.titulo && (
                                                <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                    {banner.titulo}
                                                </h2>
                                            )}
                                            {banner.descripcion && (
                                                <p className="text-white text-sm sm:text-base mt-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                    {banner.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Modo Dos Columnas (60% izq, 40% der) */
                                <div className="flex w-full h-full">
                                    {/* Columna Izquierda (Textos) */}
                                    <div className="w-[40%] h-full flex flex-col justify-center pl-5 pr-2">
                                        <h2 className="text-white text-lg sm:text-2xl font-bold leading-tight break-words">
                                            {banner.titulo}
                                        </h2>
                                        <p className="text-white/90 text-xs sm:text-sm mt-1 line-clamp-2">
                                            {banner.descripcion}
                                        </p>
                                    </div>

                                    {/* Columna Derecha (Imagen Producto) */}
                                    <div className="w-[60%] h-full relative">
                                        <Image
                                            src={banner.imagen_url}
                                            alt={banner.titulo}
                                            fill
                                            className="object-contain p-2"
                                            sizes="(max-width: 768px) 60vw, 400px"
                                            priority={i === 0}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Dots Navigators */}
            {bannersActivos.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {bannersActivos.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIndiceActual(i);
                            }}
                            className={`rounded-full transition-all duration-300 ${i === indiceActual
                                ? 'bg-white w-2 h-2 opacity-100'
                                : 'bg-white w-1.5 h-1.5 opacity-50 hover:opacity-100'
                                }`}
                            aria-label={`Ir al banner ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
