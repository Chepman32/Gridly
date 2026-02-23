import {create} from 'zustand';
import {projectStorage} from '../storage/storage';
import {ExportBatch, GridPreset, Project} from '../types/models';
import {createProject, duplicateProject} from '../services/projectService';

type AppState = {
  projects: Project[];
  loaded: boolean;
  selectedPreset: GridPreset | null;
  postedByBatch: Record<string, number[]>;
  load: () => Promise<void>;
  setSelectedPreset: (preset: GridPreset) => void;
  addProject: (params: {imageUri: string; name?: string; preset?: GridPreset}) => Promise<Project>;
  updateProject: (projectId: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<void>;
  addExportBatch: (projectId: string, batch: ExportBatch) => Promise<void>;
  setPostedTile: (batchId: string, tile: number) => void;
};

const persistProjects = async (projects: Project[]) => {
  await projectStorage.writeProjects(projects);
};

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  loaded: false,
  selectedPreset: null,
  postedByBatch: {},

  load: async () => {
    const projects = await projectStorage.readProjects();
    set({projects, loaded: true});
  },

  setSelectedPreset: preset => set({selectedPreset: preset}),

  addProject: async ({imageUri, name, preset}) => {
    const project = createProject({imageUri, name, preset: preset ?? get().selectedPreset ?? undefined});
    const projects = [project, ...get().projects];
    await persistProjects(projects);
    set({projects});
    return project;
  },

  updateProject: async (projectId, patch) => {
    const projects = get().projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            ...patch,
            updatedAt: new Date().toISOString(),
          }
        : project,
    );
    await persistProjects(projects);
    set({projects});
  },

  deleteProject: async projectId => {
    const projects = get().projects.filter(project => project.id !== projectId);
    await persistProjects(projects);
    set({projects});
  },

  duplicateProject: async projectId => {
    const source = get().projects.find(project => project.id === projectId);
    if (!source) {
      return;
    }
    const projects = [duplicateProject(source), ...get().projects];
    await persistProjects(projects);
    set({projects});
  },

  addExportBatch: async (projectId, batch) => {
    const projects = get().projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            exports: [batch, ...project.exports],
            updatedAt: new Date().toISOString(),
          }
        : project,
    );
    await persistProjects(projects);
    set({projects});
  },

  setPostedTile: (batchId, tile) => {
    const prev = get().postedByBatch[batchId] ?? [];
    const exists = prev.includes(tile);
    const next = exists ? prev.filter(item => item !== tile) : [...prev, tile];
    set({
      postedByBatch: {
        ...get().postedByBatch,
        [batchId]: next,
      },
    });
  },
}));
