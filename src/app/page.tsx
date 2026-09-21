'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useUser } from '@/context/user-context';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Cpu,
  Lock,
  Terminal,
  Sparkles,
  ArrowRight,
  CheckCircle,
  FileCode,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { LanguageToggleButton, ThemeToggleButton } from '@/components/header-controls';
import { PT_BR_TRANSLATIONS } from '@/lib/translations-ptbr';
import { RovexLoadingScreen } from '@/components/loading-screen';

export default function LoginPage() {
  const { user, login, setPassword, hasPassword, forgotPassword } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { currentLocale } = useLanguage();

  const [authMode, setAuthMode] = useState<'login' | 'setup'>('login');
  const [username, setUsername] = useState(user.name || '0xdun0');
  const [email, setEmail] = useState('0xdun0@rovex.local');
  const [password, setPasswordState] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Fraca', color: 'bg-destructive' });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisteringLoading, setIsRegisteringLoading] = useState(false);
  const [loadingStageText, setLoadingStageText] = useState('Inicializando estação Rovex...');

  useEffect(() => {
    if (user.name) {
      setUsername(user.name);
      if (user.email) {
        setEmail(user.email);
      } else {
        setEmail(`${user.name.toLowerCase().replace(/\s+/g, '.')}@rovex.local`);
      }
    }
  }, [user.name, user.email]);

  useEffect(() => {
    if (!hasPassword()) {
      setAuthMode('setup');
    } else {
      setAuthMode('login');
    }
  }, [hasPassword]);

  const t = {
    en: {
      badge: "ROVEX PLATFORM v2.4.0 · 100% PRIVATE & LOCAL-FIRST",
      heroHeadline: "Autonomous Security Reporting & Vulnerability Management",
      heroSubheadline: "Sovereign, private & free open-source offensive security platform. Built for ethical hackers, red teams, and penetration testers.",
      feature1Title: "Zero Telemetry & Local-First",
      feature1Desc: "Client data, findings, and reports never leave your machine or local server.",
      feature2Title: "AST Multi-Export Engine",
      feature2Desc: "Instant compilation to executive PDF, client DOCX, and self-contained HTML.",
      feature3Title: "MCP Native AI Assistant",
      feature3Desc: "Direct Model Context Protocol integration with Claude, Cursor, and offline LLMs.",
      feature4Title: "PBKDF2-SHA256 Cryptography",
      feature4Desc: "Zero-dependency cryptographic password derivation with anti-SSRF protections.",
      loginTab: "Log In",
      setupTab: "Create Account",
      loginTitle: "Access Rovex Console",
      loginSubtitle: "Sign in with your auditor credentials to access your assessment projects.",
      setupTitle: "Create Auditor Account",
      setupSubtitle: "Initialize your workstation master access. You will enter the setup guide (which you can skip and revisit anytime in Settings).",
      usernameLabel: "Auditor Username",
      emailLabel: "Corporate / Pentester Email",
      passwordLabel: "Master Password",
      newPasswordLabel: "Set Master Password",
      confirmPasswordLabel: "Confirm Master Password",
      loginButton: "Sign In to Workstation",
      setupButton: "Create Account & Start Setup Guide",
      forgotPassword: "Reset credentials?",
      passwordMismatch: "Passwords do not match.",
      passwordLengthError: "Password must be at least 8 characters long.",
      passwordSuccess: "Account created successfully! Launching setup guide...",
      authErrorTitle: "Authentication Failed",
      authErrorDesc: "Incorrect username or password. Check your credentials.",
      switchToSetup: "First time or need a new account? Create user",
      switchToLogin: "Already registered? Go to Log In",
      passwordStrengthWeak: "Weak",
      passwordStrengthMedium: "Moderate",
      passwordStrengthStrong: "Strong",
      passwordStrengthVeryStrong: "Military Grade",
      quote: "Forged for real-world pentest operations by 0xdun0.",
    },
    'pt-br': {
      ...PT_BR_TRANSLATIONS.login,
      badge: "PLATAFORMA ROVEX v2.4.0 · 100% PRIVADA & LOCAL-FIRST",
      heroHeadline: "Geração Autônoma de Relatórios & Gestão de Vulnerabilidades",
      heroSubheadline: "Plataforma de segurança ofensiva soberana, privada e open-source. Projetada para profissionais de segurança ofensiva, red teams e consultorias de pentest.",
      feature1Title: "Zero Telemetria & Armazenamento Local",
      feature1Desc: "Relatórios, evidências e dados de alvos nunca vazam para a nuvem.",
      feature2Title: "Compilador AST Multi-Formato",
      feature2Desc: "Exportação em 1 clique para PDF executivo, DOCX corporativo e HTML.",
      feature3Title: "Assistente de IA Nativo via MCP",
      feature3Desc: "Integração direta de protocolo MCP com Claude, Cursor e agentes locais.",
      feature4Title: "Criptografia Forte PBKDF2",
      feature4Desc: "150.000 iterações com salt único por usuário e guarda anti-SSRF interna.",
      loginTab: "INICIAR SESSÃO",
      setupTab: "CRIAR CONTA",
      loginTitle: "Acessar Estação Rovex",
      loginSubtitle: "Entre com suas credenciais de auditor para acessar seus relatórios e alvos.",
      setupTitle: "Criar Conta de Auditor",
      setupSubtitle: "Configure seu acesso mestre. Em seguida, você poderá calibrar a estação ou pular e fazer isso depois no caminho de Configurações.",
      usernameLabel: "Nome do Auditor",
      emailLabel: "E-mail Profissional",
      passwordLabel: "Senha Mestre",
      newPasswordLabel: "Definir Senha Mestre",
      confirmPasswordLabel: "Confirmar Senha Mestre",
      loginButton: "Acessar Estação de Trabalho",
      setupButton: "Criar Conta e Iniciar Configuração",
      forgotPassword: "Esqueceu ou quer redefinir?",
      passwordMismatch: "As senhas informadas não coincidem.",
      passwordLengthError: "A senha deve conter no mínimo 8 caracteres.",
      passwordSuccess: "Conta criada com sucesso! Abrindo guia de configuração...",
      authErrorTitle: "Falha na Autenticação",
      authErrorDesc: "Usuário ou senha incorretos. Verifique suas credenciais.",
      switchToSetup: "Primeiro acesso à estação? Criar novo usuário",
      switchToLogin: "Já possui conta cadastrada? Iniciar sessão",
      passwordStrengthWeak: "Fraca",
      passwordStrengthMedium: "Média",
      passwordStrengthStrong: "Forte",
      passwordStrengthVeryStrong: "Imbatível",
      quote: "Desenvolvido sob medida por 0xdun0 para auditorias de alta criticidade.",
    },
    es: {
      badge: "PLATAFORMA ROVEX v2.4.0 · 100% PRIVADA & LOCAL-FIRST",
      heroHeadline: "Generación Autónoma de Informes & Gestión de Riesgos",
      heroSubheadline: "Plataforma de seguridad ofensiva soberana, privada y de código abierto. Construida para auditores de ciberseguridad ofensiva y equipos de pentest.",
      feature1Title: "Cero Telemetría & Almacenamiento Local",
      feature1Desc: "Informes, evidencias y datos jamás salen de tu estación de trabajo.",
      feature2Title: "Compilador AST Multi-Formato",
      feature2Desc: "Generación inmediata de PDF ejecutivo, documento DOCX y HTML.",
      feature3Title: "Asistente IA Nativo vía MCP",
      feature3Desc: "Conexión directa por protocolo MCP con Claude, Cursor y LLMs locales.",
      feature4Title: "Criptografía Fuerte PBKDF2",
      feature4Desc: "Derivación con 150.000 iteraciones, salt único y protección anti-SSRF.",
      loginTab: "INICIAR SESIÓN",
      setupTab: "CREAR CUENTA",
      loginTitle: "Acceder a Consola Rovex",
      loginSubtitle: "Inicia sesión con tus credenciales de auditor para gestionar proyectos.",
      setupTitle: "Crear Cuenta de Auditor",
      setupSubtitle: "Configura tu acceso maestro. Luego serás guiado por las preferencias de la plataforma.",
      usernameLabel: "Nombre de Usuario",
      emailLabel: "Correo Profesional",
      passwordLabel: "Contraseña Maestra",
      newPasswordLabel: "Definir Contraseña Maestra",
      confirmPasswordLabel: "Confirmar Contraseña",
      loginButton: "Entrar a la Estación",
      setupButton: "Crear Cuenta e Iniciar Configuración",
      forgotPassword: "¿Olvidaste tus datos?",
      passwordMismatch: "Las contraseñas no coinciden.",
      passwordLengthError: "La contraseña debe tener al menos 8 caracteres.",
      passwordSuccess: "¡Cuenta creada! Abriendo guía de configuración...",
      authErrorTitle: "Error de autenticación",
      authErrorDesc: "Usuario o contraseña incorrectos.",
      switchToSetup: "¿Primer acceso? Crear cuenta",
      switchToLogin: "¿Ya tienes cuenta? Iniciar Sesión",
      passwordStrengthWeak: "Débil",
      passwordStrengthMedium: "Media",
      passwordStrengthStrong: "Fuerte",
      passwordStrengthVeryStrong: "Imbatible",
      quote: "Desarrollado para auditorías de seguridad por 0xdun0.",
    }
  };

  const d = (t as any)[currentLocale] || (currentLocale === 'pt-br' ? t['pt-br'] : (currentLocale === 'es' ? t.es : t.en));

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    let label = d.passwordStrengthWeak;
    let color = 'bg-destructive';

    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score < 2) {
      label = d.passwordStrengthWeak;
      color = 'bg-destructive';
    } else if (score < 4) {
      label = d.passwordStrengthMedium;
      color = 'bg-amber-500';
    } else if (score < 6) {
      label = d.passwordStrengthStrong;
      color = 'bg-emerald-500';
    } else {
      label = d.passwordStrengthVeryStrong;
      color = 'bg-emerald-600';
    }
    setPasswordStrength({ score, label, color });
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    checkPasswordStrength(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const ok = await login(username, password);
      if (ok) {
        // se o usuario habilitou exibir o setup no login, direciona para o guia
        const showSetup = typeof window !== 'undefined' && localStorage.getItem('rovex-show-setup-on-login') === 'true';
        router.push(showSetup ? '/setup' : '/report');
      } else {
        if (!hasPassword()) {
          toast({
            variant: 'destructive',
            title: d.setupTitle,
            description: d.switchToSetup,
          });
          setAuthMode('setup');
        } else {
          toast({
            variant: 'destructive',
            title: d.authErrorTitle,
            description: d.authErrorDesc,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ variant: 'destructive', title: d.passwordLengthError });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: d.passwordMismatch });
      return;
    }
    setIsRegisteringLoading(true);
    try {
      // 1. Grava as credenciais no cliente e no servidor
      await setPassword(username, newPassword);
      sessionStorage.setItem('rovex-authenticated', 'true');

      // 2. Transições progressivas durante os 4 segundos solicitados por dj (4000ms)
      setLoadingStageText(
        currentLocale === 'pt-br'
          ? 'Derivando chaves criptográficas PBKDF2-SHA256 (150.000 iterações)...'
          : (currentLocale === 'es'
            ? 'Derivando claves criptográficas PBKDF2-SHA256...'
            : 'Deriving PBKDF2-SHA256 master cryptographic keys...')
      );
      await new Promise((r) => setTimeout(r, 1300));

      setLoadingStageText(
        currentLocale === 'pt-br'
          ? 'Calibrando espaço de trabalho e templates de pentest...'
          : (currentLocale === 'es'
            ? 'Calibrando entorno de trabajo y plantillas...'
            : 'Calibrating workstation environment & templates...')
      );
      await new Promise((r) => setTimeout(r, 1400));

      setLoadingStageText(
        currentLocale === 'pt-br'
          ? 'Preparando seu Guia de Configuração da estação...'
          : (currentLocale === 'es'
            ? 'Preparando tu Guía de Configuración...'
            : 'Preparing your Workstation Setup Guide...')
      );
      await new Promise((r) => setTimeout(r, 1300));

      toast({ title: d.passwordSuccess });
      router.push('/setup');
    } catch {
      setIsRegisteringLoading(false);
      toast({
        variant: 'destructive',
        title: d.authErrorTitle,
        description: 'Erro ao inicializar estação. Tente novamente.',
      });
    }
  };

  const handleForgot = () => {
    forgotPassword();
    setAuthMode('setup');
    toast({
      title: d.forgotPassword,
      description: d.setupSubtitle,
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-between overflow-x-hidden selection:bg-primary/30">
      {/* Tela de Loading Executiva de 4 segundos solicitada por dj */}
      {isRegisteringLoading && (
        <RovexLoadingScreen
          fullScreen
          message={loadingStageText}
          submessage={
            currentLocale === 'pt-br'
              ? 'Configurando ambiente local criptografado...'
              : (currentLocale === 'es'
                ? 'Configurando entorno local cifrado...'
                : 'Configuring encrypted workstation environment...')
          }
        />
      )}

      {/* Grade de Fundo Sóbria */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Barra de Controles do Topo */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md bg-background/50">
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <LanguageToggleButton />
        </div>
      </header>

      {/* Conteúdo Principal — Duas Colunas Executivas */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Coluna da Esquerda: Showcase & Pilares Rovex */}
        <section className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border/70 text-foreground/80 text-xs font-mono font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#29bc86]" />
              {d.badge}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-headline text-foreground leading-[1.15]">
              {d.heroHeadline}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {d.heroSubheadline}
            </p>
          </div>

          {/* 4 Cards de Destaque Tecnológico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-md hover:border-primary/40 transition-all group shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-muted/80 border border-border/70 flex items-center justify-center text-foreground/80 group-hover:text-primary group-hover:border-primary/40 transition-colors mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1 font-headline">
                {d.feature1Title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {d.feature1Desc}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-md hover:border-primary/40 transition-all group shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-muted/80 border border-border/70 flex items-center justify-center text-foreground/80 group-hover:text-primary group-hover:border-primary/40 transition-colors mb-3">
                <FileCode className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1 font-headline">
                {d.feature2Title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {d.feature2Desc}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-md hover:border-primary/40 transition-all group shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-muted/80 border border-border/70 flex items-center justify-center text-foreground/80 group-hover:text-primary group-hover:border-primary/40 transition-colors mb-3">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1 font-headline">
                {d.feature3Title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {d.feature3Desc}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-md hover:border-primary/40 transition-all group shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-muted/80 border border-border/70 flex items-center justify-center text-foreground/80 group-hover:text-primary group-hover:border-primary/40 transition-colors mb-3">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1 font-headline">
                {d.feature4Title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {d.feature4Desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground font-mono">
            <Terminal className="w-4 h-4 text-primary shrink-0" />
            <span>{d.quote}</span>
          </div>
        </section>

        {/* Coluna da Direita: Terminal de Autenticação & Registro */}
        <section className="lg:col-span-5 w-full flex justify-center">
          <Card className="w-full max-w-md shadow-sm border border-border/80 bg-card/95 rounded-2xl relative overflow-hidden">
            <CardHeader className="pt-6 pb-4 text-center">
              {/* Seletor Tático de Abas */}
              <div className="grid grid-cols-2 p-1 bg-muted/70 rounded-xl mb-5 border border-border/70">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={cn(
                    "py-2.5 text-xs font-semibold rounded-lg transition-all tracking-wider uppercase flex items-center justify-center gap-2",
                    authMode === 'login'
                      ? "bg-background text-foreground shadow-sm border border-border/60 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Lock className="w-3.5 h-3.5" />
                  {d.loginTab}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('setup')}
                  className={cn(
                    "py-2.5 text-xs font-semibold rounded-lg transition-all tracking-wider uppercase flex items-center justify-center gap-2",
                    authMode === 'setup'
                      ? "bg-background text-foreground shadow-sm border border-border/60 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {d.setupTab}
                </button>
              </div>

              <CardTitle className="font-headline text-2xl font-bold tracking-tight text-foreground">
                {authMode === 'login' ? d.loginTitle : d.setupTitle}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-1">
                {authMode === 'login' ? d.loginSubtitle : d.setupSubtitle}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pb-6">
              {authMode === 'login' ? (
                /* FORMULÁRIO DE LOGIN */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-username" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      {d.usernameLabel}
                    </Label>
                    <Input
                      id="login-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="0xdun0"
                      autoComplete="username"
                      className="bg-background/80 border-border/80 focus:border-primary h-11"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                        {d.passwordLabel}
                      </Label>
                      <button
                        type="button"
                        onClick={handleForgot}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
                      >
                        {d.forgotPassword}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPasswordState(e.target.value)}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                        className="bg-background/80 border-border/80 focus:border-primary h-11 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold text-sm shadow-md mt-6 flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : (
                      <>
                        <span>{d.loginButton}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('setup')}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
                    >
                      {d.switchToSetup}
                    </button>
                  </div>
                </form>
              ) : (
                /* FORMULÁRIO DE REGISTRO */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-username" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      {d.usernameLabel}
                    </Label>
                    <Input
                      id="reg-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="0xdun0"
                      autoComplete="username"
                      className="bg-background/80 border-border/80 focus:border-primary h-11 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      {d.emailLabel}
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="0xdun0@rovex.local"
                      autoComplete="email"
                      className="bg-background/80 border-border/80 focus:border-primary h-11 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      {d.newPasswordLabel}
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        className="bg-background/80 border-border/80 focus:border-primary h-11 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Medidor de Força da Senha */}
                    {newPassword.length > 0 && (
                      <div className="pt-1 space-y-1">
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          <div className={cn("rounded-full transition-all", passwordStrength.score >= 1 ? passwordStrength.color : "bg-muted")} />
                          <div className={cn("rounded-full transition-all", passwordStrength.score >= 3 ? passwordStrength.color : "bg-muted")} />
                          <div className={cn("rounded-full transition-all", passwordStrength.score >= 5 ? passwordStrength.color : "bg-muted")} />
                          <div className={cn("rounded-full transition-all", passwordStrength.score >= 6 ? passwordStrength.color : "bg-muted")} />
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                          <span>Segurança:</span>
                          <span className="font-semibold text-foreground">{passwordStrength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirm" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      {d.confirmPasswordLabel}
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha mestre"
                        autoComplete="new-password"
                        className={cn(
                          "bg-background/80 border-border/80 focus:border-primary h-11 pr-10",
                          confirmPassword && newPassword && confirmPassword !== newPassword && "border-destructive focus:border-destructive"
                        )}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword && confirmPassword === newPassword && (
                      <p className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Senhas conferem
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold text-sm shadow-md mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : (
                      <>
                        <span>{d.setupButton}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center pt-1 leading-relaxed">
                    {currentLocale === 'pt-br'
                      ? 'Ao concluir, o Guia de Configuração será aberto. Se preferir não configurá-lo agora, você pode pular e acessá-lo a qualquer momento em Configurações.'
                      : currentLocale === 'es'
                      ? 'Al registrarte se abrirá la Guía de Configuración. Si prefieres no hacerlo ahora, puedes omitirla y abrirla cuando desees en Ajustes.'
                      : 'After account setup, the configuration guide will launch. If you prefer to set it up later, you can skip and access it anytime in Settings.'}
                  </p>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
                    >
                      {d.switchToLogin}
                    </button>
                  </div>
                </form>
              )}
            </CardContent>

            <div className="px-6 py-3 bg-muted/40 border-t border-border/50 text-center text-xs text-muted-foreground">
              Rovex Security Platform · Developed by{' '}
              <a
                href="https://github.com/0xdun0"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary font-medium"
              >
                0xdun0
              </a>
            </div>
          </Card>
        </section>
      </main>

      {/* Rodapé Minimalista */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-muted-foreground border-t border-border/30">
        Rovex Platform — Sovereign Penetration Testing Reports & Vulnerability Management
      </footer>
    </div>
  );
}
