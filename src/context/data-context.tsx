



'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { Client, Project, Finding, Vulnerability, ImageAsset, ProjectTemplate, ProjectType } from '@/lib/types';
import { initialClients } from '@/lib/clients-data';
import { initialProjects } from '@/lib/projects-data';
import { generateProjectId, normalizeProject } from '@/lib/project-utils';
import { initialImages } from '@/lib/images-data';
import {
    loadAllImages,
    saveAllImages,
    clearAllImages,
    readLegacyLocalStorageImages,
    clearLegacyLocalStorageImages,
} from '@/lib/image-store';
import { initialFindings } from '@/lib/findings-data';
import { initialVulnerabilities } from '@/lib/vulnerabilities-data';
import { initialProjectTemplates } from '@/lib/project-templates-data';
import {
    BUILTIN_THEMES,
    DEFAULT_THEME_ID,
    cloneTheme,
    isBuiltinThemeId,
    type ReportTheme,
} from '@/lib/report-themes';
import { format } from 'date-fns';

const STATE_ENDPOINT = '/api/state';
const STATE_DEBOUNCE_MS = 500;

// incrementado para atualizar templates locais com suporte nativo a portugues
const TEMPLATES_MIGRATION_VERSION = 2;

// Atualiza modelos embutidos com os dados iniciais do seed
// preservando os modelos personalizados criados pelo usuario
// (identificadores ausentes no seed).
function refreshBuiltInTemplates(current: ProjectTemplate[]): ProjectTemplate[] {
    const seedIds = new Set(initialProjectTemplates.map(t => t.id));
    const userTemplates = current.filter(t => !seedIds.has(t.id));
    return [...initialProjectTemplates, ...userTemplates];
}

// Versao de migracao para sincronizar dados de demonstracao do seed
// sem sobrescrever dados reais ja persistidos pelo operador.
const SEED_MIGRATION_VERSION = 4;

// Projetos de demonstracao descontinuados que devem ser limpos do estado.
const RETIRED_SAMPLE_PROJECT_IDS = ['proj-htb-imagery', 'proj-htb-haze'];

// Adiciona entrada do seed caso o id ainda nao exista no estado atual.
function withSeedItems<T extends { id: string }>(current: T[], seed: T[]): T[] {
    const known = new Set(current.map(item => item.id));
    const missing = seed.filter(item => !known.has(item.id));
    return missing.length ? [...current, ...missing] : current;
}

// Atualiza exclusivamente logos de clientes de demonstracao mantendo
// instalacoes existentes atualizadas sem alterar cadastros do usuario.
function refreshSampleClientLogos(current: Client[]): Client[] {
    const logos = new Map(
        initialClients
            .filter(client => client.id === 'cli-h4ck' || client.id === 'cli-trilocor')
            .map(client => [client.id, client.logoUrl]),
    );
    return current.map(client => {
        const logoUrl = logos.get(client.id);
        return logoUrl ? { ...client, logoUrl } : client;
    });
}
type PersistedStateShape = {
    clients?: Client[];
    projects?: Project[];
    findings?: Finding[];
    vulnerabilities?: Vulnerability[];
    images?: ImageAsset[];
    projectTemplates?: ProjectTemplate[];
    themes?: ReportTheme[];
    activeThemeId?: string;
};


interface DataContextType {
  clients: Client[];
  projects: Project[];
  findings: Finding[];
  vulnerabilities: Vulnerability[];
  images: ImageAsset[];
  projectTemplates: ProjectTemplate[];
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'reportBody' | 'startDate' | 'endDate'> & { scope: string; startDate: Date, endDate: Date; type?: ProjectType }) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => void;
  addFinding: (finding: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>) => Finding;
  updateFinding: (finding: Omit<Finding, 'createdAt' | 'updatedAt'>) => void;
  deleteFinding: (findingId: string) => void;
  addVulnerability: (vulnerability: Omit<Vulnerability, 'id'>) => void;
  updateVulnerability: (vulnerability: Vulnerability) => void;
  deleteVulnerability: (vulnerabilityId: string) => void;
  addImage: (dataUrl: string) => ImageAsset;
  getImage: (id: string) => ImageAsset | undefined;
  addProjectTemplate: (template: Omit<ProjectTemplate, 'id'>) => void;
  updateProjectTemplate: (template: ProjectTemplate) => void;
  deleteProjectTemplate: (templateId: string) => void;
  themes: ReportTheme[];
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  getAllThemes: () => ReportTheme[];
  getThemeById: (id: string | undefined | null) => ReportTheme;
  addTheme: (theme: ReportTheme) => ReportTheme;
  updateTheme: (theme: ReportTheme) => void;
  deleteTheme: (themeId: string) => void;
  duplicateTheme: (themeId: string) => ReportTheme | undefined;
  exportData: () => void;
  importData: (jsonData: string) => void;
  wipeAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function usePersistedState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        const storage = typeof window !== 'undefined' && typeof window.localStorage?.getItem === 'function'
            ? window.localStorage
            : null;

        if (!storage) {
            return initialValue;
        }
        try {
            const item = storage.getItem(key);
            if (item) return JSON.parse(item);
            return initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        const storage = typeof window !== 'undefined' && typeof window.localStorage?.setItem === 'function'
            ? window.localStorage
            : null;

        if (!storage) return;

        try {
            storage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
}

// imagens ficam no IndexedDB para nao estourar a cota de 5MB do localStorage
function useIndexedDbImages(initialValue: ImageAsset[]): [ImageAsset[], React.Dispatch<React.SetStateAction<ImageAsset[]>>, boolean] {
    const [images, setImages] = useState<ImageAsset[]>(initialValue);
    const [ready, setReady] = useState(false);
    const loadedRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        let cancelled = false;
        (async () => {
            try {
                const fromIdb = await loadAllImages();
                if (cancelled) return;
                if (fromIdb.length > 0) {
                    setImages(fromIdb);
                } else {
                    const legacy = readLegacyLocalStorageImages();
                    if (legacy && legacy.length > 0) {
                        setImages(legacy);
                        await saveAllImages(legacy);
                    }
                    clearLegacyLocalStorageImages();
                }
            } catch (error) {
                console.error('Erro ao carregar imagens do IndexedDB:', error);
            } finally {
                if (!cancelled) {
                    loadedRef.current = true;
                    setReady(true);
                }
            }
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        // Evita sobrescrever IndexedDB com o valor semente antes de concluir o carregamento sob demanda.
        if (!loadedRef.current) return;
        saveAllImages(images).catch((error) => {
            console.error('Erro salvando imagens no IndexedDB:', error);
        });
    }, [images]);

    return [images, setImages, ready];
}

export function DataProvider({ children }: { children: ReactNode }) {
    const [clients, setClients] = usePersistedState<Client[]>('rovex-clients-v4', initialClients);
    const [projects, setProjects] = usePersistedState<Project[]>('rovex-projects-v4', initialProjects);
    const [findings, setFindings] = usePersistedState<Finding[]>('rovex-findings-v4', initialFindings);
    const [vulnerabilities, setVulnerabilities] = usePersistedState<Vulnerability[]>('rovex-vulnerabilities-v4', initialVulnerabilities);
    const [images, setImages, imagesReady] = useIndexedDbImages(initialImages);
    const [projectTemplates, setProjectTemplates] = usePersistedState<ProjectTemplate[]>('rovex-project-templates-v4', initialProjectTemplates);
    const [themes, setThemes] = usePersistedState<ReportTheme[]>('rovex-themes-v1', []);
    const [activeThemeId, setActiveThemeIdState] = usePersistedState<string>('rovex-active-theme-v1', DEFAULT_THEME_ID);
    const [templatesMigration, setTemplatesMigration] = usePersistedState<number>('rovex-templates-migration', 0);
    const [seedMigration, setSeedMigration] = usePersistedState<number>('rovex-seed-migration', 0);

    const [remoteHydrated, setRemoteHydrated] = useState(false);
    const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // On mount, hydrate from server-side state file if available.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(STATE_ENDPOINT, { cache: 'no-store' });
                if (!res.ok) return;
                const remote = (await res.json()) as PersistedStateShape | null;
                if (cancelled || !remote || typeof remote !== 'object') return;

                if (Array.isArray(remote.clients)) setClients(remote.clients);
                if (Array.isArray(remote.projects)) setProjects(remote.projects.map(normalizeProject));
                if (Array.isArray(remote.findings)) setFindings(remote.findings);
                if (Array.isArray(remote.vulnerabilities)) setVulnerabilities(remote.vulnerabilities);
                if (Array.isArray(remote.images)) setImages(remote.images);
                if (Array.isArray(remote.projectTemplates)) setProjectTemplates(remote.projectTemplates);
                if (Array.isArray(remote.themes)) setThemes(remote.themes);
                if (typeof remote.activeThemeId === 'string' && remote.activeThemeId) setActiveThemeIdState(remote.activeThemeId);
            } catch {
                // Network or server error - keep using localStorage values.
            } finally {
                if (!cancelled) {
                    setRemoteHydrated(true);
                }
            }
        })();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sincronizacao unica de modelos integrados com o seed
    // executada apos a hidratacao remota sem concorrencia.
    // Modelos criados pelo usuario permanecem intactos.
    useEffect(() => {
        if (!remoteHydrated) return;
        if (templatesMigration >= TEMPLATES_MIGRATION_VERSION) return;
        setProjectTemplates(prev => refreshBuiltInTemplates(prev));
        setTemplatesMigration(TEMPLATES_MIGRATION_VERSION);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteHydrated, templatesMigration]);

    // Limpa projetos de demonstracao obsoletos uma unica vez por navegador e
    // migra identificadores legados (proj-htb-haze -> proj-writeup-haze-2026),
    // preservando todos os dados do operador e integridade referencial.
    useEffect(() => {
        if (!remoteHydrated) return;
        if (seedMigration >= SEED_MIGRATION_VERSION) return;
        const retired = new Set(RETIRED_SAMPLE_PROJECT_IDS);
        const seedSampleProjects = initialProjects.filter(p => p.id.startsWith('proj-htb-') || p.id === 'proj-writeup-haze-2026');
        const seedSampleIds = new Set(seedSampleProjects.map(p => p.id));
        const seedSampleNames = new Set(seedSampleProjects.map(p => p.name));
        setProjects(prev => {
            // Migra proj-htb-haze existente para proj-writeup-haze-2026 mantendo reportBody intacto
            const migrated = prev.map(p => {
                if (p.id === 'proj-htb-haze') {
                    return {
                        ...p,
                        id: 'proj-writeup-haze-2026',
                        type: 'writeup' as const,
                        language: p.language || 'pt-br',
                    };
                }
                return p;
            });

            // Remove duplicatas se houver e filtra apos migracao
            const uniqueMap = new Map<string, Project>();
            for (const p of migrated) {
                if (!retired.has(p.id) || p.id === 'proj-writeup-haze-2026') {
                    if (!uniqueMap.has(p.id)) {
                        uniqueMap.set(p.id, p);
                    }
                }
            }
            const cleaned = Array.from(uniqueMap.values()).filter(p =>
                !(seedSampleNames.has(p.name) && !seedSampleIds.has(p.id))
            );
            return withSeedItems(cleaned, seedSampleProjects);
        });

        // Atualiza integridade de findings
        setFindings(prev => prev.map(f => f.projectId === 'proj-htb-haze' ? { ...f, projectId: 'proj-writeup-haze-2026' } : f));
        setClients(prev => refreshSampleClientLogos(withSeedItems(prev, initialClients)));
        setImages(prev => withSeedItems(prev, initialImages));
        setSeedMigration(SEED_MIGRATION_VERSION);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteHydrated, seedMigration]);

    // sync debounced do estado no servidor
    // imagesReady impede sincronizar estado padrao enquanto IndexedDB carrega
    useEffect(() => {
        if (!remoteHydrated || !imagesReady) return;
        if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
        writeTimerRef.current = setTimeout(() => {
            const payload: PersistedStateShape = {
                clients, projects, findings, vulnerabilities, images, projectTemplates, themes, activeThemeId,
            };
            fetch(STATE_ENDPOINT, {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
            }).catch(() => {
                // Best-effort sync; localStorage still holds the data.
            });
        }, STATE_DEBOUNCE_MS);
        return () => {
            if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
        };
    }, [remoteHydrated, imagesReady, clients, projects, findings, vulnerabilities, images, projectTemplates, themes, activeThemeId]);

    const wipeAllData = () => {
        // limpa chaves rovex do localstorage
        const keys = [
            'rovex-clients-v4', 'rovex-projects-v4', 'rovex-findings-v4',
            'rovex-vulnerabilities-v4', 'rovex-images-v4', 'rovex-project-templates-v4',
            'rovex-themes-v1', 'rovex-active-theme-v1',
        ];
        keys.forEach((k) => localStorage.removeItem(k));
        clearAllImages().catch(() => { /* best-effort */ });
    };

    // Theme functions
    const getAllThemes = (): ReportTheme[] => {
        // temas embutidos primeiro, depois customizados; embutidos sao imutaveis
        return [...BUILTIN_THEMES, ...themes.filter((t) => !isBuiltinThemeId(t.id))];
    };

    const getThemeById = (id: string | undefined | null): ReportTheme => {
        const all = getAllThemes();
        if (id) {
            const found = all.find((t) => t.id === id);
            if (found) return found;
        }
        const active = all.find((t) => t.id === activeThemeId);
        return active ?? BUILTIN_THEMES[0];
    };

    const setActiveThemeId = (id: string) => {
        setActiveThemeIdState(id);
    };

    const addTheme = (theme: ReportTheme): ReportTheme => {
        const safe: ReportTheme = isBuiltinThemeId(theme.id)
            ? { ...cloneTheme(theme), id: `custom-${Date.now()}` }
            : cloneTheme(theme);
        setThemes((prev) => [...prev, safe]);
        return safe;
    };

    const updateTheme = (theme: ReportTheme) => {
        if (isBuiltinThemeId(theme.id)) return;
        setThemes((prev) => prev.map((t) => (t.id === theme.id ? cloneTheme(theme) : t)));
    };

    const deleteTheme = (themeId: string) => {
        if (isBuiltinThemeId(themeId)) return;
        setThemes((prev) => prev.filter((t) => t.id !== themeId));
        if (activeThemeId === themeId) {
            setActiveThemeIdState(DEFAULT_THEME_ID);
        }
    };

    const duplicateTheme = (themeId: string): ReportTheme | undefined => {
        const source = getAllThemes().find((t) => t.id === themeId);
        if (!source) return undefined;
        const copy: ReportTheme = {
            ...cloneTheme(source),
            id: `custom-${Date.now()}`,
            name: `${source.name} (copy)`,
        };
        setThemes((prev) => [...prev, copy]);
        return copy;
    };

    // Client functions
    const addClient = (client: Omit<Client, 'id'>): Client => {
        const newClient: Client = { ...client, id: `cli-${Date.now()}` };
        setClients(prev => [...prev, newClient]);
        return newClient;
    };
    const updateClient = (client: Client) => {
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
    };
    const deleteClient = (clientId: string) => {
        setClients(prev => prev.filter(c => c.id !== clientId));
    };

    const touchProject = (projectId: string) => {
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === projectId ? { ...p, updatedAt: new Date().toISOString() } : p
        )
      );
    }

    // Funcoes de projeto
    const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'reportBody' | 'startDate' | 'endDate'> & { scope: string; startDate: Date, endDate: Date; type?: ProjectType }): Project => {
        const now = new Date().toISOString();
        let reportBody = project.scope;

        if (project.scope) {
          reportBody = reportBody.replace(/\[TODO Start Date\]/g, format(project.startDate, 'yyyy-MM-dd'));
          reportBody = reportBody.replace(/\[TODO End Date\]/g, format(project.endDate, 'yyyy-MM-dd'));
        }

        const clientObj = clients.find(c => c.id === project.clientId);
        const resolvedType: ProjectType = project.type || 'pentest';
        const generatedId = generateProjectId({
            type: resolvedType,
            name: project.name,
            clientName: clientObj?.name,
            startDate: project.startDate,
            existingIds: projects.map(p => p.id),
        });

        const { scope: _scope, ...projectRest } = project;
        const newProject: Project = normalizeProject({
            ...projectRest,
            type: resolvedType,
            id: generatedId,
            icon: project.icon || 'FileText',
            reportBody,
            startDate: format(project.startDate, 'yyyy-MM-dd'),
            endDate: format(project.endDate, 'yyyy-MM-dd'),
            createdAt: now,
            updatedAt: now,
        });
        setProjects(prev => [...prev, newProject]);
        return newProject;
    };
    const updateProject = (project: Project) => {
        const now = new Date().toISOString();
        setProjects(prev => prev.map(p => p.id === project.id ? { ...project, updatedAt: now } : p));
    };
    const deleteProject = (projectId: string) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        // Also delete associated findings
        setFindings(prev => prev.filter(f => f.projectId !== projectId));
    };
    
    const duplicateProject = (projectId: string) => {
      const projectToDuplicate = projects.find(p => p.id === projectId);
      if (projectToDuplicate) {
        const now = new Date().toISOString();
        const newProject = {
          ...projectToDuplicate,
          id: `proj-${Date.now()}`,
          name: `${projectToDuplicate.name} (Copia)`,
          createdAt: now,
          updatedAt: now,
        };
        setProjects(prev => [...prev, newProject]);
      }
    }

    // Finding functions
    const addFinding = (finding: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>): Finding => {
        const now = new Date().toISOString();
        const newFinding = {
            ...finding,
            id: `find-${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        }
        setFindings(prev => [...prev, newFinding]);
        touchProject(finding.projectId);
        return newFinding;
    };
    const updateFinding = (finding: Omit<Finding, 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, ...finding, updatedAt: now } : f));
        touchProject(finding.projectId);
    };
    const deleteFinding = (findingId: string) => {
        const finding = findings.find(f => f.id === findingId);
        if(finding){
          touchProject(finding.projectId);
        }
        setFindings(prev => prev.filter(f => f.id !== findingId));
    };

    // Vulnerability functions
    const addVulnerability = (vulnerability: Omit<Vulnerability, 'id'>) => {
        setVulnerabilities(prev => [...prev, { ...vulnerability, id: `vuln-${Date.now()}` }]);
    };
    const updateVulnerability = (vulnerability: Vulnerability) => {
        setVulnerabilities(prev => prev.map(v => v.id === vulnerability.id ? vulnerability : v));
    };
    const deleteVulnerability = (vulnerabilityId: string) => {
        setVulnerabilities(prev => prev.filter(v => v.id !== vulnerabilityId));
    };
    
    // Image Asset functions
    const addImage = (dataUrl: string): ImageAsset => {
      const newImage: ImageAsset = {
        id: `img-${Date.now()}`,
        dataUrl,
      };
      setImages(prev => [...prev, newImage]);
      return newImage;
    };
  
    const getImage = (id: string): ImageAsset | undefined => {
      return images.find(img => img.id === id);
    };

    // Project Template functions
    const addProjectTemplate = (template: Omit<ProjectTemplate, 'id'>) => {
        const newTemplate = { ...template, id: `ptpl-${Date.now()}` };
        setProjectTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
    };
    const updateProjectTemplate = (template: ProjectTemplate) => {
        setProjectTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    };
    const deleteProjectTemplate = (templateId: string) => {
        setProjectTemplates(prev => prev.filter(t => t.id !== templateId));
    };

    // Backup & Import
    const exportData = () => {
        const backupData = {
          version: '1.0.2',
          createdAt: new Date().toISOString(),
          data: { clients, projects, findings, vulnerabilities, images, projectTemplates, themes, activeThemeId },
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rovex-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importData = (jsonData: string) => {
        const parsedData = JSON.parse(jsonData);
        if (parsedData.data) {
            setClients(parsedData.data.clients || []);
            setProjects(parsedData.data.projects || []);
            setFindings(parsedData.data.findings || []);
            setVulnerabilities(parsedData.data.vulnerabilities || []);
            setImages(parsedData.data.images || []);
            setProjectTemplates(parsedData.data.projectTemplates || []);
            if (Array.isArray(parsedData.data.themes)) {
                setThemes(parsedData.data.themes.filter((t: ReportTheme) => t && !isBuiltinThemeId(t.id)));
            }
            if (typeof parsedData.data.activeThemeId === 'string' && parsedData.data.activeThemeId) {
                setActiveThemeIdState(parsedData.data.activeThemeId);
            }
        } else {
            throw new Error("Invalid backup file format");
        }
    };

    return (
        <DataContext.Provider value={{
            clients, projects, findings, vulnerabilities, images, projectTemplates,
            addClient, updateClient, deleteClient,
            addProject, updateProject, deleteProject, duplicateProject,
            addFinding, updateFinding, deleteFinding,
            addVulnerability, updateVulnerability, deleteVulnerability,
            addImage, getImage,
            addProjectTemplate, updateProjectTemplate, deleteProjectTemplate,
            themes, activeThemeId,
            setActiveThemeId,
            getAllThemes, getThemeById,
            addTheme, updateTheme, deleteTheme, duplicateTheme,
            exportData, importData,
            wipeAllData
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
