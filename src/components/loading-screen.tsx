'use client'; // componente client side interativo

import React, { useEffect, useState } from 'react'; // hooks basicos do react
import Image from 'next/image'; // componente otimizado para o logo
import { useLanguage } from '@/context/language-context'; // contexto de internacionalizacao
import { cn } from '@/lib/utils'; // utilitario de classes condicionais

interface LoadingScreenProps {
  message?: string; // mensagem de status customizada
  submessage?: string; // explicacao secundaria
  className?: string; // classes adicionais
  fullScreen?: boolean; // modo tela cheia ou inline
}

export function RovexLoadingScreen({
  message, // mensagem personalizada
  submessage, // sub-mensagem personalizada
  className, // classes extras
  fullScreen = false, // padrao em container relativo
}: LoadingScreenProps) {
  const { currentLocale } = useLanguage(); // pega locale ativo
  const [secondsElapsed, setSecondsElapsed] = useState(0); // cronometro de segundos decorridos

  // contador de tempo decorrido para acalmar o usuario em tarefas longas
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1); // incrementa a cada segundo
    }, 1000); // 1 segundo

    return () => clearInterval(timer); // limpeza na desmontagem
  }, []); // executa uma vez

  // micro-textos progressivos apos 3s para evitar a sensacao de travamento
  const getProgressStage = () => {
    // 0 a 2 segundos: inicializacao limpa
    if (secondsElapsed < 2) {
      if (currentLocale === 'pt-br') return 'Carregando dados da plataforma...'; // pt
      if (currentLocale === 'es') return 'Cargando datos de la plataforma...'; // es
      return 'Loading platform workspace...'; // en
    }
    // 2 a 4 segundos: compilando escopo e evidencias
    if (secondsElapsed < 4) {
      if (currentLocale === 'pt-br') return 'Compilando evidências e escopo...'; // pt
      if (currentLocale === 'es') return 'Compilando evidencias y alcance...'; // es
      return 'Compiling evidence and assessment scope...'; // en
    }
    // 4 a 7 segundos: calculando metricas
    if (secondsElapsed < 7) {
      if (currentLocale === 'pt-br') return 'Mapeando métricas de risco e CVSS...'; // pt
      if (currentLocale === 'es') return 'Mapeando métricas de riesgo y CVSS...'; // es
      return 'Mapping vulnerability risk and CVSS metrics...'; // en
    }
    // mais de 7 segundos: finalizacao segura
    if (currentLocale === 'pt-br') return 'Gerando visualização criptografada do relatório...'; // pt
    if (currentLocale === 'es') return 'Generando visualización cifrada del informe...'; // es
    return 'Finalizing encrypted report rendering...'; // en
  };

  // detalhe secundario amigavel que surge apos 3s
  const getTechnicalDetail = () => {
    if (submessage) return submessage; // se tiver sub-mensagem explicita usa ela
    if (secondsElapsed >= 3) {
      if (currentLocale === 'pt-br') return 'Processando blocos de dados. Quase pronto...'; // pt
      if (currentLocale === 'es') return 'Procesando bloques de datos. Casi listo...'; // es
      return 'Processing document blocks. Almost ready...'; // en
    }
    return ''; // nos primeiros 3s mantem visual limpo
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center select-none', // centralizacao
        fullScreen ? 'fixed inset-0 z-50 bg-background/90 backdrop-blur-md' : 'min-h-[50vh] w-full', // modo tela cheia ou inline
        className // classes externas
      )}
      role="status" // acessibilidade
      aria-live="polite" // leitura dinamica
    >
      {/* spinner concêntrico profissional e executivo (estilo Apple Pro / Linear) */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-5">
        {/* anel externo estatico de precisao */}
        <div className="absolute inset-0 rounded-full border border-border/40" />

        {/* anel sutil tracejado com rotacao lenta e elegante */}
        <div className="absolute inset-1.5 rounded-full border border-dashed border-border/60 animate-[spin_20s_linear_infinite]" />

        {/* arco de progresso primario com gradiente suave em rotacao continua */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/40 animate-spin" />

        {/* segundo arco menor de rotacao contraria dando profundidade tecnica */}
        <div className="absolute inset-3.5 rounded-full border-2 border-transparent border-b-primary/60 border-l-primary/20 animate-[spin_3s_cubic-bezier(0.4,0,0.2,1)_infinite_reverse]" />

        {/* circulo central com o logo oficial rovex ampliado na cor #29bc86 */}
        <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-background/85 border border-primary/25 backdrop-blur-sm shadow-sm">
          <Image
            src="/rovex-icon.png" // asset oficial rovex na cor #29bc86
            alt="Rovex" // acessibilidade
            width={34} // largura proporcional ampliada
            height={34} // altura proporcional ampliada
            className="w-8 h-8 object-contain opacity-95 transition-opacity drop-shadow-[0_0_10px_rgba(41,188,134,0.35)]" // brilho tatico na cor da marca
            priority // carregamento prioritario
          />
        </div>


      </div>

      {/* textos e status informativos */}
      <div className="flex flex-col items-center max-w-sm gap-1">
        {/* mensagem principal de progresso */}
        <h3 className="text-sm font-semibold tracking-tight text-foreground font-sans">
          {message || getProgressStage()}
        </h3>

        {/* micro-texto explicativo que surge apos 3s para acalmar o usuario */}
        {getTechnicalDetail() && (
          <p className="text-xs text-muted-foreground leading-normal mt-0.5 animate-in fade-in duration-300">
            {getTechnicalDetail()}
          </p>
        )}

        {/* indicador visual com tempo decorrido para relatorios demorados */}
        {secondsElapsed >= 3 && (
          <span className="mt-2 text-[10px] font-mono text-muted-foreground/80 px-2 py-0.5 rounded-md bg-secondary/50 border border-border/40">
            {secondsElapsed}s decorridos
          </span>
        )}
      </div>
    </div>
  );
}

// export default para importacao rapida
export default RovexLoadingScreen;
