import Link from 'next/link'; // link de navegacao padrao
import Image from 'next/image'; // componente otimizado de imagem
import { cn } from '@/lib/utils'; // utilitario de classes condicionais

interface LogoProps {
  className?: string; // classes extras opcionais
  isCollapsed?: boolean; // flag para sidebar minimizada
  /** Render as a link to the dashboard. Defaults to true. */
  asLink?: boolean; // se deve envolver em link
  href?: string; // rota destino
}

export function Logo({ className, isCollapsed = false, asLink = true, href = '/report' }: LogoProps) {
  const content = ( // estrutura visual interna do logotipo
    <span className={cn('flex items-center select-none font-headline tracking-tight', isCollapsed ? 'justify-center w-full' : 'gap-3', className)}>
      {/* icone isometrico em fita rovex com dimensao ampliada e cor #29bc86 */}
      <span className="relative flex items-center justify-center h-9 w-9 shrink-0">
        <Image
          src="/rovex-icon.png" // asset oficial rovex na cor #29bc86
          alt="Rovex Logo" // acessibilidade
          width={38} // largura ampliada
          height={38} // altura ampliada
          className="h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(41,188,134,0.35)]" // brilho tatico na cor #29bc86
          priority // carregamento prioritario
        />
      </span>
      {/* tipografia com nome rovex em branco puro e escala maior */}
      {!isCollapsed && (
        <span className="flex flex-col justify-center transition-opacity duration-200">
          {/* nome rovex se adapta ao tema: escuro no light mode e claro no dark mode */}
          <span className="text-[19px] font-bold tracking-tight text-foreground leading-none font-sans lowercase">
            rovex
          </span>
          <span className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground font-semibold leading-none mt-1">
            security reports
          </span>
        </span>
      )}


    </span>
  );

  if (!asLink) return content; // retorna apenas o elemento se nao for link

  return (
    <Link
      href={href} // destino ao clicar
      aria-label="Rovex — Security Reports" // acessibilidade
      className={cn('inline-flex items-center rounded-lg p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary', isCollapsed ? 'justify-center w-full' : 'w-full')}
    >
      {content}
    </Link>
  );
}

