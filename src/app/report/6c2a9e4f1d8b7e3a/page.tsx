'use client'; // componente client side interativo

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/language-context';
import { PlusCircle, Edit, Trash2, FilePlus2, Search, LayoutTemplate, Layers } from '@/components/icons';
import Link from 'next/link';
import { useData } from '@/context/data-context';
import { Input } from '@/components/ui/input';
import type { ProjectTemplate } from '@/lib/types';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ProjectIcon, projectIconComponents } from '@/components/project-icon';

export default function LayoutsPage() {
  const { currentLocale } = useLanguage();
  const { projectTemplates, deleteProjectTemplate } = useData();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<ProjectTemplate | null>(null);

  const t = {
    en: {
      title: 'Report Layouts',
      description: 'Preconfigured executive structures, assessment scopes and delivery standards.',
      newLayout: 'New Layout',
      search: 'Search layouts...',
      edit: 'Edit Layout',
      delete: 'Delete',
      createProject: 'Deploy Scope',
      builtin: 'Core System',
      custom: 'Custom Scope',
      empty: 'No layouts matching active search query.',
      confirmDeleteTitle: 'Delete layout?',
      confirmDeleteDesc: 'This operation is permanent and removes the layout from the deployment registry.',
      cancel: 'Cancel',
      layoutDeleted: 'Layout deleted successfully.',
      tagSections: 'Sections',
    },
    'pt-br': {
      title: 'Layouts de Relatório',
      description: 'Estruturas executivas pré-configuradas, escopos de auditoria e modelos de entrega.',
      newLayout: 'Novo Layout',
      search: 'Buscar layouts…',
      edit: 'Editar Layout',
      delete: 'Excluir',
      createProject: 'Usar Layout',
      builtin: 'Padrão do Sistema',
      custom: 'Customizado',
      empty: 'Nenhum layout encontrado com os termos de busca.',
      confirmDeleteTitle: 'Excluir layout?',
      confirmDeleteDesc: 'Esta operação é definitiva e removerá este layout da base do sistema.',
      cancel: 'Cancelar',
      layoutDeleted: 'Layout removido com sucesso.',
      tagSections: 'Seções',
    },
    es: {
      title: 'Layouts de Informe',
      description: 'Estructuras ejecutivas preconfiguradas, alcances de auditoría y estándares de entrega.',
      newLayout: 'Nuevo Layout',
      search: 'Buscar layouts...',
      edit: 'Editar Layout',
      delete: 'Eliminar',
      createProject: 'Usar Layout',
      builtin: 'Estándar',
      custom: 'Personalizado',
      empty: 'No se encontraron layouts con los términos activos.',
      confirmDeleteTitle: '¿Eliminar layout?',
      confirmDeleteDesc: 'Esta operación es definitiva y eliminará este layout del sistema.',
      cancel: 'Cancelar',
      layoutDeleted: 'Layout eliminado con éxito.',
      tagSections: 'Secciones',
    },
  };

  const dict = t[currentLocale] || t.en;

  // recupera nome e descricao no idioma ativo priorizando portugues quando selecionado
  const name = (tpl: ProjectTemplate) =>
    (currentLocale === 'pt-br' ? tpl.name_pt || tpl.name_en : currentLocale === 'es' ? tpl.name_es : tpl.name_en) || tpl.name_en;
  const desc = (tpl: ProjectTemplate) =>
    (currentLocale === 'pt-br' ? tpl.description_pt || tpl.description_en : currentLocale === 'es' ? tpl.description_es : tpl.description_en) || '';

  const sortedAndFilteredTemplates = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = projectTemplates.filter(template =>
      template.name_en.toLowerCase().includes(term) ||
      template.name_es.toLowerCase().includes(term) ||
      (template.name_pt && template.name_pt.toLowerCase().includes(term)) ||
      template.description_en.toLowerCase().includes(term) ||
      template.description_es.toLowerCase().includes(term) ||
      (template.description_pt && template.description_pt.toLowerCase().includes(term))
    );

    filtered.sort((a, b) => name(a).localeCompare(name(b)));
    return filtered;
  }, [projectTemplates, searchTerm, currentLocale]);

  const handleDelete = () => {
    if (templateToDelete) {
      deleteProjectTemplate(templateToDelete.id);
      toast({ title: dict.layoutDeleted });
      setTemplateToDelete(null);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* cabecalho executivo com status e busca rapida */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {dict.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              {sortedAndFilteredTemplates.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{dict.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={dict.search}
              className="w-full sm:w-[220px] lg:w-[300px] pl-8 h-9 text-xs bg-background rounded-lg border-border/70"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button asChild className="h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5 shadow-xs">
            <Link href="/report/6c2a9e4f1d8b7e3a/edit/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>{dict.newLayout}</span>
            </Link>
          </Button>
        </div>
      </div>

      {sortedAndFilteredTemplates.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border/60 rounded-xl bg-card/30">
          <LayoutTemplate className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{dict.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedAndFilteredTemplates.map((template) => {
            const Icon = projectIconComponents[template.icon] || ProjectIcon;
            const isDeletable = template.id.startsWith('ptpl-');

            return (
              <Card key={template.id} className="flex flex-col rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-border transition-all duration-200 shadow-xs group">
                <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono tracking-wider shrink-0 border-border/70 bg-background/50">
                      {isDeletable ? dict.custom : dict.builtin}
                    </Badge>
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/report/6c2a9e4f1d8b7e3a/edit/${template.id}`}
                      className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {name(template)}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {desc(template)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-border/50 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs font-semibold gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30" asChild>
                      <Link href={`/report/9a4f2c1b8e7d3a6e/new?template=${template.id}`}>
                        <FilePlus2 className="h-3.5 w-3.5" />
                        <span>{dict.createProject}</span>
                      </Link>
                    </Button>

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title={dict.edit} asChild>
                      <Link href={`/report/6c2a9e4f1d8b7e3a/edit/${template.id}`}>
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                    </Button>

                    {isDeletable && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={dict.delete}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setTemplateToDelete(template)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-border/80">
                          <AlertDialogHeader>
                            <AlertDialogTitle>{dict.confirmDeleteTitle}</AlertDialogTitle>
                            <AlertDialogDescription>{dict.confirmDeleteDesc}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>{dict.cancel}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{dict.delete}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
