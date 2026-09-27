'use client'; // componente client side interativo

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Eye, EyeOff, Trash2, ShieldCheck, AlertCircle, Sparkles, ArrowRight } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/language-context';
import { useUser } from '@/context/user-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, currentLocale } = useLanguage();
  const { changePassword, logout } = useUser();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const t = {
    en: {
      title: 'Security & Access Settings',
      description: 'Manage master operator password, session authentication, and database destruction controls.',
      badgeStatus: 'CREDENTIALS ENCRYPTED',
      changePasswordTitle: 'Update Master Password',
      changePasswordDesc: 'Set a new cryptographic password for authenticating to this local Rovex node.',
      currentPasswordLabel: 'Current Master Password',
      newPasswordLabel: 'New Master Password',
      confirmNewPasswordLabel: 'Confirm New Password',
      updatePasswordBtn: 'Update Password',
      passwordUpdateSuccess: 'Master password updated successfully.',
      passwordUpdateError: 'Authentication failed. Please verify your current password.',
      passwordMismatch: 'The confirmation does not match your new password.',
      deleteAccountTitle: 'Danger Zone: Purge Workspace & Account',
      deleteAccountDesc: 'Irrevocably erases all operator profiles, targets, projects, and collected evidences.',
      deleteAccountBtn: 'Purge Entire Workspace',
      confirmDeleteTitle: 'Purge all data and destroy account?',
      confirmDeleteDesc: 'This action is irreversible. All targets, projects, evidences, and layout configurations will be permanently destroyed. Ensure you have an exported snapshot if you intend to restore your data.',
      cancel: 'Cancel',
      delete: 'Permanently Purge',
    },
    'pt-br': {
      title: 'Segurança e Configurações',
      description: 'Gerencie a senha mestre de acesso, autenticação do operador e controles de destruição de dados.',
      badgeStatus: 'CREDENCIAS CRIPTOGRAFADAS',
      changePasswordTitle: 'Alterar Senha Mestre',
      changePasswordDesc: 'Defina uma nova senha para autenticação de acesso local a este nó do Rovex.',
      currentPasswordLabel: 'Senha Atual',
      newPasswordLabel: 'Nova Senha',
      confirmNewPasswordLabel: 'Confirmar Nova Senha',
      updatePasswordBtn: 'Atualizar Senha',
      passwordUpdateSuccess: 'Senha mestre atualizada com sucesso.',
      passwordUpdateError: 'Falha na autenticação. Verifique sua senha atual.',
      passwordMismatch: 'A confirmação não coincide com a nova senha digitada.',
      deleteAccountTitle: 'Zona Crítica: Destruir Base e Conta',
      deleteAccountDesc: 'Apaga irreversivelmente todos os dados do operador, alvos, projetos e evidências registradas.',
      deleteAccountBtn: 'Purgar Todo o Ambiente',
      confirmDeleteTitle: 'Purgar todos os dados e resetar conta?',
      confirmDeleteDesc: 'Esta ação é irreversível. Todos os alvos, projetos, evidências e layouts serão permanentemente destruídos. Certifique-se de ter um snapshot exportado antes de confirmar.',
      cancel: 'Cancelar',
      delete: 'Confirmar e Purgar',
    },
    es: {
      title: 'Seguridad y Ajustes',
      description: 'Gestiona la contraseña maestra de acceso, autenticación de sesión y controles de borrado total.',
      badgeStatus: 'CREDENCIALES CIFRADAS',
      changePasswordTitle: 'Cambiar Contraseña Maestra',
      changePasswordDesc: 'Define una nueva contraseña para la autenticación local en este nodo Rovex.',
      currentPasswordLabel: 'Contraseña Actual',
      newPasswordLabel: 'Nueva Contraseña',
      confirmNewPasswordLabel: 'Confirmar Nueva Contraseña',
      updatePasswordBtn: 'Actualizar Contraseña',
      passwordUpdateSuccess: 'Contraseña actualizada con éxito.',
      passwordUpdateError: 'Error de autenticación. Verifica tu contraseña actual.',
      passwordMismatch: 'Las contraseñas no coinciden.',
      deleteAccountTitle: 'Zona de Peligro: Destruir Entorno y Cuenta',
      deleteAccountDesc: 'Elimina de forma irreversible todos los objetivos, proyectos y evidencias registradas.',
      deleteAccountBtn: 'Purgar Todo el Entorno',
      confirmDeleteTitle: '¿Eliminar todos los datos y purgar la cuenta?',
      confirmDeleteDesc: 'Esta acción no se puede deshacer. Todos los objetivos, proyectos y evidencias serán destruidos permanentemente. Asegúrate de tener una copia de respaldo antes de confirmar.',
      cancel: 'Cancelar',
      delete: 'Confirmar y Purgar',
    },
  };

  const currentDict = (t as Record<string, typeof t.en>)[currentLocale] || t.en;

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({ variant: 'destructive', title: currentDict.passwordMismatch });
      return;
    }
    if (await changePassword(currentPassword, newPassword)) {
      toast({ title: currentDict.passwordUpdateSuccess });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      toast({ variant: 'destructive', title: currentDict.passwordUpdateError });
    }
  };

  const handleDeleteAccount = () => {
    logout(true); // Indica exclusao total e expurgo de dados locais
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1200px] mx-auto">
      {/* cabecalho executivo */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {currentDict.title}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="h-3 w-3 text-primary" />
              {currentDict.badgeStatus}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{currentDict.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* card 0: Guia de Configuração da Plataforma */}
        <Card className="rounded-xl border border-border/70 bg-card/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground font-semibold text-base font-headline">
              <Sparkles className="h-4 w-4 text-[#29bc86]" />
              <span>
                {currentLocale === 'pt-br'
                  ? 'Guia de Configuração da Plataforma'
                  : currentLocale === 'es'
                  ? 'Guía de Configuración de la Plataforma'
                  : 'Platform Setup Guide'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              {currentLocale === 'pt-br'
                ? 'Checklist guiado para calibrar seu perfil de auditor, temas de exportação de relatório, biblioteca de modelos e validação do servidor MCP.'
                : currentLocale === 'es'
                ? 'Lista de verificación guiada para calibrar perfil, temas de exportación, plantillas y servidor MCP.'
                : 'Interactive checklist to calibrate auditor profile, export themes, report templates, and MCP server connectivity.'}
            </p>
          </div>
          <Button
            onClick={() => router.push('/setup')}
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <span>
              {currentLocale === 'pt-br' ? 'Abrir Guia de Configuração' : currentLocale === 'es' ? 'Abrir Guía' : 'Open Setup Guide'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Card>

        {/* card 1: alteracao de senha */}
        <Card className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-border/40">
            <KeyRound className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-base text-foreground">{currentDict.changePasswordTitle}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">{currentDict.changePasswordDesc}</p>

          <div className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <Label htmlFor="current-password" className="text-xs font-medium text-muted-foreground">
                {currentDict.currentPasswordLabel}
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-9 text-xs bg-background pr-9"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-medium text-muted-foreground">
                  {currentDict.newPasswordLabel}
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9 text-xs bg-background pr-9"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-new-password" className="text-xs font-medium text-muted-foreground">
                  {currentDict.confirmNewPasswordLabel}
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="h-9 text-xs bg-background pr-9"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  >
                    {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Button onClick={handlePasswordChange} className="h-9 px-4 rounded-lg text-xs font-semibold gap-2 shadow-xs">
                <KeyRound className="h-3.5 w-3.5" />
                <span>{currentDict.updatePasswordBtn}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* card 2: zona de perigo / destruicao */}
        <Card className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <h2 className="font-semibold text-base">{currentDict.deleteAccountTitle}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{currentDict.deleteAccountDesc}</p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="h-9 px-3.5 rounded-lg text-xs font-semibold border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors gap-2">
                <Trash2 className="h-3.5 w-3.5" />
                <span>{currentDict.deleteAccountBtn}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-destructive/40 max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base text-destructive font-semibold">{currentDict.confirmDeleteTitle}</AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  {currentDict.confirmDeleteDesc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-2">
                <AlertDialogCancel className="h-8 text-xs">{currentDict.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold">
                  {currentDict.delete}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </div>
  );
}
