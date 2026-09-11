import type { Project } from '@/lib/types';

export type ProjectStatus = Project['status'];

export const PROJECT_STATUS_VARIANT: Record<ProjectStatus, 'status-completed' | 'status-in-progress' | 'status-on-hold' | 'status-blocked' | 'status-archived'> = {
  'Completed': 'status-completed',
  'In Progress': 'status-in-progress',
  'On Hold': 'status-on-hold',
};

export const PROJECT_STATUS_LABEL = {
  en: {
    'Completed': 'Completed',
    'In Progress': 'In Progress',
    'On Hold': 'On Hold',
  },
  'pt-br': {
    'Completed': 'Concluído',
    'In Progress': 'Em progresso',
    'On Hold': 'Pendente',
  },
  es: {
    'Completed': 'Completado',
    'In Progress': 'En progreso',
    'On Hold': 'Pendiente',
  },
} as const;

export function getProjectStatusVariant(status: string) {
  return (PROJECT_STATUS_VARIANT as Record<string, string>)[status] || 'secondary';
}

export function getProjectStatusLabel(status: string, language: 'en' | 'pt-br' | 'es' | string) {
  const map = (PROJECT_STATUS_LABEL as Record<string, Record<string, string>>)[language] || PROJECT_STATUS_LABEL.en;
  return map[status] || status;
}
