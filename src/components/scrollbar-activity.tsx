'use client';

import { useEffect } from 'react';

// adiciona classe scrolling no html durante a rolagem e remove apos inatividade
// usado no globals.css para exibir barras de rolagem de forma suave e elegante
const IDLE_MS = 700;

export function ScrollbarActivity() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      root.classList.add('scrolling');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => root.classList.remove('scrolling'), IDLE_MS);
    };

    // escuta scroll em fase de captura para cobrir containers aninhados
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}
