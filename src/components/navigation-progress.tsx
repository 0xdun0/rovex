'use client'; // componente client side interativo

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'; // hooks do react
import { usePathname, useRouter } from 'next/navigation'; // hooks de navegacao do next
import { useLanguage } from '@/context/language-context'; // contexto de idioma
import { RovexLoadingScreen } from '@/components/loading-screen'; // animacao oficial rovex
import { getRouteLoadingInfo } from '@/lib/route-loading-messages'; // textos contextuais
import { cn } from '@/lib/utils'; // utilitario de juncao de classes condicionais

interface NavigationContextType {
  startTransitionTo: (path: string, customTitle?: string, customSubtitle?: string) => void;
  isNavigating: boolean;
}

const NavigationContext = createContext<NavigationContextType>({
  startTransitionTo: () => {},
  isNavigating: false,
});

export function useNavigationTransition() {
  return useContext(NavigationContext);
}

type TransitionState = 'idle' | 'navigating' | 'finishing';

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // rota atual
  const { currentLocale } = useLanguage(); // idioma selecionado (pt-br, en, es)
  const router = useRouter(); // roteador do next
  
  // controle do ciclo de vida da transicao visual
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [targetPath, setTargetPath] = useState<string>('');
  const [loadingInfo, setLoadingInfo] = useState<{ title: string; subtitle: string }>({
    title: '',
    subtitle: '',
  });

  const startTimeRef = useRef<number>(0);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // limpa todos os timers pendentes
  const clearAllTimers = useCallback(() => {
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  // inicia o fade-out elegante apos confirmacao de pintura no navegador
  const beginFinishingSequence = useCallback(() => {
    // aguarda 2 quadros de animacao para garantir que o react e o browser pintaram a nova rota
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionState('finishing');
        // remove do dom apos conclusao da transicao de opacidade (300ms)
        finishTimerRef.current = setTimeout(() => {
          setTransitionState('idle');
          setTargetPath('');
        }, 320);
      });
    });
  }, []);

  // inicia a transicao visual imediatamente no clique
  const startTransitionTo = useCallback((path: string, customTitle?: string, customSubtitle?: string) => {
    clearAllTimers();

    const info = getRouteLoadingInfo(path, currentLocale);
    setLoadingInfo({
      title: customTitle || info.title,
      subtitle: customSubtitle || info.subtitle,
    });
    setTargetPath(path);
    startTimeRef.current = Date.now();
    setTransitionState('navigating'); // exibe na tela no exato milissegundo do clique

    // timer de seguranca caso o browser cancele ou ocorra erro
    safetyTimerRef.current = setTimeout(() => {
      beginFinishingSequence();
    }, 6000);

    // realiza a navegacao programatica
    router.push(path);
  }, [currentLocale, router, clearAllTimers, beginFinishingSequence]);

  // observa a mudanca de rota para finalizar o loading somente quando a pagina nova carregar
  useEffect(() => {
    if (transitionState === 'navigating') {
      const cleanTarget = targetPath.split('?')[0].split('#')[0];
      const hasReachedDestination = Boolean(
        cleanTarget && (pathname === cleanTarget || pathname.startsWith(cleanTarget))
      );

      // se a nova rota ja esta ativa no pathname
      if (hasReachedDestination) {
        const elapsed = Date.now() - startTimeRef.current;
        // retencao minima calibrada (1100ms) para que o radar tatico e as mensagens no idioma sejam apreciadas
        const remaining = Math.max(0, 1100 - elapsed);

        const timer = setTimeout(() => {
          beginFinishingSequence();
        }, remaining);

        return () => clearTimeout(timer);
      }
    }
  }, [pathname, transitionState, targetPath, beginFinishingSequence]);

  // captura global de cliques em links internos dentro da aplicacao
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        link.getAttribute('target') === '_blank'
      ) {
        return;
      }

      const cleanHref = href.split('?')[0].split('#')[0];
      // se for rota interna diferente da atual
      if (cleanHref.startsWith('/report') && cleanHref !== pathname) {
        clearAllTimers();
        const info = getRouteLoadingInfo(href, currentLocale);
        setLoadingInfo(info);
        setTargetPath(href);
        startTimeRef.current = Date.now();
        setTransitionState('navigating'); // dispara o loading instantaneamente antes do router processar

        safetyTimerRef.current = setTimeout(() => {
          beginFinishingSequence();
        }, 6000);
      }
    };

    // anexa listener na fase de captura para precedencia total
    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      clearAllTimers();
    };
  }, [pathname, currentLocale, clearAllTimers, beginFinishingSequence]);

  const isNavigating = transitionState !== 'idle';
  const isFinishing = transitionState === 'finishing';

  return (
    <NavigationContext.Provider value={{ startTransitionTo, isNavigating }}>
      {children}

      {/* overlay com fundo escuro solido, sem transparencia para impedir qualquer clarisao ou flash branco */}
      {isNavigating && (
        <div 
          className={cn(
            'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-300 ease-out select-none',
            isFinishing ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
          )}
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <RovexLoadingScreen
            message={loadingInfo.title}
            submessage={loadingInfo.subtitle}
            fullScreen={false}
          />
        </div>
      )}
    </NavigationContext.Provider>
  );
}
