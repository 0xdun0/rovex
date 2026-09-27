'use client'; // componente client side para interacao
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // componentes de avatar
import { Button } from "@/components/ui/button"; // botao estilizado
import {
  DropdownMenu, // container do menu dropdown
  DropdownMenuContent, // conteudo flutuante do menu
  DropdownMenuGroup, // grupo de links
  DropdownMenuItem, // item clicavel do menu
  DropdownMenuLabel, // cabecalho com dados do usuario
  DropdownMenuSeparator, // linha divisoria sutil
  DropdownMenuTrigger, // gatilho que abre o menu
} from "@/components/ui/dropdown-menu"; // biblioteca de dropdown
import { useLanguage } from "@/context/language-context"; // contexto de internacionalizacao
import Link from "next/link"; // navegacao interna rapida
import { useUser } from "@/context/user-context"; // dados do usuario ativo
import { useRouter } from "next/navigation"; // hook de roteamento
import { User, Palette, Mcp, Settings, LogOut, ChevronDown, LayoutTemplate, History, Sparkles } from "@/components/icons"; // icones visuais
import { DASHBOARD_ROUTES } from "@/lib/routes"; // rotas canonicas ofuscadas do rovex

export function UserNav() {
  const { currentLocale } = useLanguage(); // pega idioma selecionado
  const { user, logout } = useUser(); // pega usuario e funcao de logout
  const router = useRouter(); // roteador do next

  // encerra a sessao e volta para login
  const handleLogout = () => {
    logout(); // limpa dados da sessao local
    router.push('/'); // redireciona para a raiz
  };

  // dicionario com termos tecnicos preservados
  const t = {
    en: {
      profile: "Profile", // link de perfil
      layouts: "Layouts", // modelos e layouts de relatorio
      vault: "Vault", // cofre e restauracao
      themes: "Themes", // gerenciador de temas
      mcp: "MCP", // integracao com agentes de IA
      settings: "Settings", // configuracoes da conta
      logout: "Log out", // sair da conta
      role: "Security Consultant", // cargo padrao
    },
    'pt-br': {
      profile: "Perfil", // tela de perfil do operador
      layouts: "Layouts", // modelos de relatorio
      vault: "Cofre", // cofre e restauracao
      themes: "Temas", // editor de temas de relatorio
      mcp: "MCP", // protocol de contexto de modelo
      settings: "Configurações", // ajustes do sistema
      logout: "Sair", // encerrar autenticacao
      role: "Consultor de Segurança", // funcao do pentester
    },
    es: {
      profile: "Perfil", // perfil do operador
      layouts: "Layouts", // modelos e layouts
      vault: "Bóveda", // cofre e restauracao
      themes: "Temas", // temas de relatorio
      mcp: "MCP", // integracao mcp
      settings: "Ajustes", // configuracoes
      logout: "Cerrar sesión", // sair
      role: "Consultor de Seguridad", // papel de seguranca
    }
  };

  const currentDict = t[currentLocale] || t.en; // fallback seguro

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* botao na navbar com avatar nome do usuario e chevron */}
        <Button
          variant="ghost" // estilo limpo e discreto
          className="flex items-center gap-2.5 h-10 px-2.5 rounded-lg border border-border/50 hover:bg-accent/10 hover:border-border transition-colors focus-visible:ring-1 focus-visible:ring-primary" // layout elegante
          aria-label={user.name} // acessibilidade
        >
          {/* avatar do usuario */}
          <Avatar className="h-7 w-7 rounded-md border border-border/60">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-md">
              {user.avatar ? user.name.charAt(0) : <User className="h-3.5 w-3.5" />}
            </AvatarFallback>
          </Avatar>
          {/* nome do usuario exibido na navbar conforme pedido */}
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[130px]">{user.name}</span>
            <span className="text-[10px] text-muted-foreground leading-none">{currentDict.role}</span>
          </div>
          {/* seta indicadora de menu */}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      {/* lista de navegacao: perfil, temas, mcp, configuracoes */}
      <DropdownMenuContent className="w-56 p-1.5 shadow-xl border-border/80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal px-2 py-1.5">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        {/* grupo com as telas de operacao do operador */}
        <DropdownMenuGroup>
          {/* 1. perfil */}
          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
            <Link href={DASHBOARD_ROUTES.profile}>
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{currentDict.profile}</span>
            </Link>
          </DropdownMenuItem>
          {/* 2. layouts (modelos de relatorio) */}
          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
            <Link href={DASHBOARD_ROUTES.layouts}>
              <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
              <span>{currentDict.layouts}</span>
            </Link>
          </DropdownMenuItem>
          {/* 3. vault (cofre e restauracao) */}
          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
            <Link href={DASHBOARD_ROUTES.vault}>
              <History className="h-4 w-4 text-muted-foreground" />
              <span>{currentDict.vault}</span>
            </Link>
          </DropdownMenuItem>
          {/* 4. temas */}
          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
            <Link href={DASHBOARD_ROUTES.themes}>
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span>{currentDict.themes}</span>
            </Link>
          </DropdownMenuItem>
          {/* 5. mcp */}
          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
            <Link href={DASHBOARD_ROUTES.mcp}>
              <Mcp className="h-4 w-4 text-muted-foreground" />
              <span>{currentDict.mcp}</span>
            </Link>
          </DropdownMenuItem>
          {/* 6. configuracoes (onde fica o guia de configuracao) */}
          <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
            <Link href={DASHBOARD_ROUTES.settings}>
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>{currentDict.settings}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1" />
        {/* botao de sair */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          <span>{currentDict.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
