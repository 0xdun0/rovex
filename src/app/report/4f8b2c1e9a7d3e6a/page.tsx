'use client'; // componente client side interativo

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDown, FileUp, ShieldCheck, History, AlertCircle } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/context/language-context';
import { useData } from '@/context/data-context';

export default function BackupPage() {
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const { currentLocale } = useLanguage();
  const { exportData, importData, clients, projects, findings, projectTemplates } = useData();

  const t = {
    en: {
      title: 'Data Vault & Snapshot',
      description: 'Export immutable snapshots of your operational workspace or restore historical databases.',
      vaultStatus: 'LOCAL ENCRYPTED STORAGE',
      createBackupTitle: 'Export Workspace Snapshot',
      createBackupDesc: 'Generates a complete JSON snapshot containing all targets, active projects, evidences, and custom layouts.',
      createBackupBtn: 'Export Snapshot',
      backupCreated: 'Snapshot Created',
      backupCreatedDesc: 'Operational data successfully exported to your local disk.',
      importBackupTitle: 'Restore From Snapshot',
      importBackupDesc: 'Restores all workspace state from an authenticated .json snapshot file. Existing local data will be replaced.',
      importBackupBtn: 'Select Snapshot File',
      invalidFileType: 'Invalid Snapshot Format',
      invalidFileTypeDesc: 'Please choose a valid JSON backup file.',
      importSuccess: 'Snapshot Restored',
      importSuccessDesc: 'Workspace state successfully restored and refreshed.',
      importFailed: 'Restoration Failed',
      importFailedDesc: 'The file is invalid or corrupted.',
      confirmImportTitle: 'Restore workspace from snapshot?',
      confirmImportDesc: 'This operation will replace all current local data (targets, projects, evidences) with the selected snapshot. Ensure you have an export of your current workspace before proceeding.',
      cancel: 'Cancel',
      continueImport: 'Confirm & Restore',
      statTargets: 'Targets in Vault',
      statProjects: 'Active Projects',
      statEvidences: 'Logged Evidences',
      statLayouts: 'Report Layouts',
    },
    'pt-br': {
      title: 'Cofre de Dados e Snapshots',
      description: 'Exporte snapshots completos do seu ambiente de auditoria ou restaure históricos operacionais.',
      vaultStatus: 'ARMAZENAMENTO LOCAL SEGURO',
      createBackupTitle: 'Exportar Snapshot Operacional',
      createBackupDesc: 'Gera um arquivo JSON completo com todos os alvos, projetos, evidências e layouts cadastrados.',
      createBackupBtn: 'Exportar Snapshot',
      backupCreated: 'Snapshot Gerado',
      backupCreatedDesc: 'Dados operacionais exportados com sucesso para o disco local.',
      importBackupTitle: 'Restaurar de Snapshot',
      importBackupDesc: 'Restaura a base a partir de um arquivo .json. Os dados atuais locais serão substituídos pelos dados do arquivo.',
      importBackupBtn: 'Selecionar Arquivo JSON',
      invalidFileType: 'Arquivo Inválido',
      invalidFileTypeDesc: 'Selecione um arquivo de snapshot .json válido.',
      importSuccess: 'Restauração Concluída',
      importSuccessDesc: 'O ambiente operacional foi atualizado com os dados do snapshot.',
      importFailed: 'Falha na Restauração',
      importFailedDesc: 'O arquivo está corrompido ou fora do formato esperado.',
      confirmImportTitle: 'Restaurar ambiente a partir deste snapshot?',
      confirmImportDesc: 'Esta ação substituirá os alvos, projetos e evidências locais atuais pelos dados contidos no arquivo. Certifique-se de ter um snapshot recente caso queira restaurar seu estado atual.',
      cancel: 'Cancelar',
      continueImport: 'Confirmar e Restaurar',
      statTargets: 'Alvos no Cofre',
      statProjects: 'Projetos Ativos',
      statEvidences: 'Evidências Registradas',
      statLayouts: 'Layouts de Entrega',
    },
    es: {
      title: 'Bóveda de Datos y Snapshots',
      description: 'Exporta instantáneas completas de tu entorno operativo o restaura bases históricas.',
      vaultStatus: 'ALMACENAMIENTO LOCAL SEGURO',
      createBackupTitle: 'Exportar Instantánea Operativa',
      createBackupDesc: 'Genera un archivo JSON completo con todos los objetivos, proyectos, evidencias y layouts.',
      createBackupBtn: 'Exportar Snapshot',
      backupCreated: 'Instantánea Creada',
      backupCreatedDesc: 'Datos operativos exportados exitosamente al disco.',
      importBackupTitle: 'Restaurar desde Snapshot',
      importBackupDesc: 'Restaura la base desde un archivo .json. Los datos locales actuales serán reemplazados.',
      importBackupBtn: 'Seleccionar Archivo JSON',
      invalidFileType: 'Archivo Inválido',
      invalidFileTypeDesc: 'Por favor, selecciona un archivo JSON de copia válido.',
      importSuccess: 'Restauración Exitosa',
      importSuccessDesc: 'El entorno operativo ha sido restaurado exitosamente.',
      importFailed: 'Fallo al Restaurar',
      importFailedDesc: 'El archivo está dañado o no tiene el formato correcto.',
      confirmImportTitle: '¿Restaurar entorno desde esta instantánea?',
      confirmImportDesc: 'Esta acción sobrescribirá todos los datos locales actuales (objetivos, proyectos, evidencias). Asegúrate de tener una copia de respaldo antes de continuar.',
      cancel: 'Cancelar',
      continueImport: 'Confirmar y Restaurar',
      statTargets: 'Objetivos en Bóveda',
      statProjects: 'Proyectos Activos',
      statEvidences: 'Evidencias Registradas',
      statLayouts: 'Layouts de Entrega',
    },
  };

  const dict = t[currentLocale] || t.en;

  const handleCreateBackup = () => {
    exportData();
    toast({
      title: dict.backupCreated,
      description: dict.backupCreatedDesc,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        setBackupFile(file);
        setShowConfirmDialog(true);
      } else {
        toast({
          variant: 'destructive',
          title: dict.invalidFileType,
          description: dict.invalidFileTypeDesc,
        });
      }
    }
    event.target.value = '';
  };

  const handleImport = () => {
    if (!backupFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importData(content);
        toast({
          title: dict.importSuccess,
          description: dict.importSuccessDesc,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: dict.importFailed,
          description: dict.importFailedDesc,
        });
      } finally {
        setShowConfirmDialog(false);
        setBackupFile(null);
      }
    };
    reader.readAsText(backupFile);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* cabecalho executivo */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {dict.title}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {dict.vaultStatus}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{dict.description}</p>
        </div>
      </div>

      {/* painel de metricas da base de dados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">{dict.statTargets}</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">{clients.length}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">{dict.statProjects}</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">{projects.length}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">{dict.statEvidences}</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">{findings.length}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">{dict.statLayouts}</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">{projectTemplates.length}</p>
        </div>
      </div>

      {/* grid com as duas estacoes de operacao */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* estacao 1: exportar snapshot */}
        <Card className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm flex flex-col justify-between p-6">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-foreground">{dict.createBackupTitle}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{dict.createBackupDesc}</p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border/50">
            <Button onClick={handleCreateBackup} className="w-full h-10 rounded-lg font-medium text-xs gap-2 shadow-xs">
              <FileDown className="h-4 w-4" />
              <span>{dict.createBackupBtn}</span>
            </Button>
          </div>
        </Card>

        {/* estacao 2: restaurar snapshot */}
        <Card className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm flex flex-col justify-between p-6">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-foreground">{dict.importBackupTitle}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{dict.importBackupDesc}</p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border/50">
            <Input id="backup-file" type="file" accept=".json,application/json" onChange={handleFileChange} className="hidden" />
            <Button
              variant="outline"
              onClick={() => document.getElementById('backup-file')?.click()}
              className="w-full h-10 rounded-lg font-medium text-xs gap-2 border-border/80 hover:bg-muted/40"
            >
              <FileUp className="h-4 w-4" />
              <span>{dict.importBackupBtn}</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* modal de confirmacao critico de restauracao */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="border-border/80 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">{dict.confirmImportTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {dict.confirmImportDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel onClick={() => setBackupFile(null)} className="h-8 text-xs">{dict.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">{dict.continueImport}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
