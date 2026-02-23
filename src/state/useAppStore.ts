import RNFS from 'react-native-fs';
import {create} from 'zustand';
import {createProject, duplicateProject} from '../services/projectService';
import {migrateFromAsyncStorage, projectStorage} from '../storage/storage';
import {
  ALL_PROJECTS_FOLDER_ID,
  ExportBatch,
  Folder,
  GridPreset,
  Project,
  TRASH_FOLDER_ID,
  isProjectInTrash,
} from '../types/models';
import {toRelativeImagePath} from '../utils/imagePath';
import {makeId} from '../utils/id';

const IMAGE_DIR = `${RNFS.DocumentDirectoryPath}/gridly/images`;
const FALLBACK_FOLDER_NAME = 'Folder';

type AppState = {
  projects: Project[];
  folders: Folder[];
  loaded: boolean;
  selectedPreset: GridPreset | null;
  postedByBatch: Record<string, number[]>;
  load: () => Promise<void>;
  setSelectedPreset: (preset: GridPreset) => void;
  addFolder: (name: string) => Folder | null;
  addProject: (params: {imageUri: string; name?: string; preset?: GridPreset}) => Promise<Project>;
  updateProject: (projectId: string, patch: Partial<Project>) => void;
  renameProject: (projectId: string, nextName: string) => void;
  deleteProject: (projectId: string) => void;
  moveProjectToTrash: (projectId: string) => void;
  recoverProject: (projectId: string) => void;
  removeProjectPermanently: (projectId: string) => void;
  cleanTrash: () => void;
  moveProjectToFolder: (projectId: string, folderId: string) => void;
  duplicateProject: (projectId: string) => void;
  renameFolder: (folderId: string, nextName: string) => void;
  removeFolder: (folderId: string) => void;
  addExportBatch: (projectId: string, batch: ExportBatch) => void;
  setPostedTile: (batchId: string, tile: number) => void;
};

const sanitizeFolders = (folders: Folder[]) => {
  const seen = new Set<string>();
  const sanitized: Folder[] = [];
  for (const folder of folders) {
    if (
      !folder?.id ||
      folder.id === TRASH_FOLDER_ID ||
      folder.id === ALL_PROJECTS_FOLDER_ID ||
      folder.id === 'folder-default'
    ) {
      continue;
    }
    if (seen.has(folder.id)) {
      continue;
    }
    seen.add(folder.id);
    sanitized.push({
      id: folder.id,
      name: folder.name?.trim() || FALLBACK_FOLDER_NAME,
      createdAt: folder.createdAt || new Date().toISOString(),
      updatedAt: folder.updatedAt || new Date().toISOString(),
    });
  }
  return sanitized;
};

const normalizeProjects = (projects: Project[], folders: Folder[]) => {
  const folderIds = new Set(folders.map(folder => folder.id));
  let changed = false;

  const normalized = projects.map(project => {
    if (project.folderId === TRASH_FOLDER_ID) {
      const nextPreviousFolderId =
        project.previousFolderId && folderIds.has(project.previousFolderId)
          ? project.previousFolderId
          : undefined;
      if (project.previousFolderId !== nextPreviousFolderId) {
        changed = true;
        return {
          ...project,
          folderId: TRASH_FOLDER_ID,
          previousFolderId: nextPreviousFolderId,
        };
      }
      return project;
    }

    const nextFolderId =
      project.folderId && folderIds.has(project.folderId) ? project.folderId : undefined;
    const nextPreviousFolderId =
      project.previousFolderId && folderIds.has(project.previousFolderId)
        ? project.previousFolderId
        : undefined;

    if (
      project.folderId !== nextFolderId ||
      project.previousFolderId !== nextPreviousFolderId
    ) {
      changed = true;
      return {
        ...project,
        folderId: nextFolderId,
        previousFolderId: nextPreviousFolderId,
      };
    }

    return project;
  });

  return {projects: normalized, changed};
};

/**
 * Convert any absolute file:// imageUri paths to relative paths.
 * This ensures images survive container path changes (e.g. pod install + rebuild).
 */
const migrateToRelativeImagePaths = (projects: Project[]) => {
  let changed = false;
  const nextProjects = projects.map(project => {
    const relative = toRelativeImagePath(project.imageUri);
    if (relative !== project.imageUri) {
      changed = true;
      return {
        ...project,
        imageUri: relative,
        updatedAt: new Date().toISOString(),
      };
    }
    return project;
  });
  return {projects: nextProjects, changed};
};

/**
 * Legacy migration: copy images from outside DocumentDirectoryPath into gridly/images.
 * Only needed for very old projects that reference tmp/cache paths.
 */
const maybeMigrateProjectImageUris = async (projects: Project[]) => {
  let changed = false;
  let dirReady = false;
  const nextProjects = [...projects];

  for (let index = 0; index < nextProjects.length; index += 1) {
    const project = nextProjects[index];
    const imageUri = project.imageUri;
    if (!imageUri.startsWith('file://')) {
      continue;
    }

    const sourcePath = decodeURIComponent(imageUri.replace(/^file:\/\//, ''));
    if (!sourcePath || sourcePath.startsWith(RNFS.DocumentDirectoryPath)) {
      continue;
    }

    try {
      const sourceExists = await RNFS.exists(sourcePath);
      if (!sourceExists) {
        continue;
      }

      if (!dirReady) {
        const exists = await RNFS.exists(IMAGE_DIR);
        if (!exists) {
          await RNFS.mkdir(IMAGE_DIR);
        }
        dirReady = true;
      }

      const ext = sourcePath.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg';
      const destinationPath = `${IMAGE_DIR}/${project.id}.${ext}`;
      const destinationExists = await RNFS.exists(destinationPath);
      if (!destinationExists) {
        await RNFS.copyFile(sourcePath, destinationPath);
      }

      const nextImageUri = `file://${destinationPath}`;
      if (nextImageUri !== project.imageUri) {
        changed = true;
        nextProjects[index] = {
          ...project,
          imageUri: nextImageUri,
          updatedAt: new Date().toISOString(),
        };
      }
    } catch {
      // Keep the current URI if migration fails
    }
  }

  return {projects: nextProjects, changed};
};

const persistState = (projects: Project[], folders: Folder[]) => {
  projectStorage.writeProjects(projects);
  projectStorage.writeFolders(folders);
};

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  folders: [],
  loaded: false,
  selectedPreset: null,
  postedByBatch: {},

  load: async () => {
    // Migrate data from AsyncStorage to MMKV on first launch
    await migrateFromAsyncStorage();

    const storedProjects = projectStorage.readProjects();
    const storedFolders = projectStorage.readFolders();

    const folders = sanitizeFolders(storedFolders);
    const normalized = normalizeProjects(storedProjects, folders);
    const migrated = await maybeMigrateProjectImageUris(normalized.projects);
    const relativized = migrateToRelativeImagePaths(migrated.projects);

    if (
      normalized.changed ||
      migrated.changed ||
      relativized.changed ||
      folders.length !== storedFolders.length
    ) {
      persistState(relativized.projects, folders);
    }

    set({projects: relativized.projects, folders, loaded: true});
  },

  setSelectedPreset: preset => set({selectedPreset: preset}),

  addFolder: name => {
    const folderName = name.trim();
    if (!folderName) {
      return null;
    }
    const now = new Date().toISOString();
    const folder: Folder = {
      id: makeId('folder'),
      name: folderName,
      createdAt: now,
      updatedAt: now,
    };
    const folders = [...get().folders, folder];
    persistState(get().projects, folders);
    set({folders});
    return folder;
  },

  addProject: async ({imageUri, name, preset}) => {
    const folderId = get().folders[0]?.id;
    const relativeUri = toRelativeImagePath(imageUri);
    const project = createProject({
      imageUri: relativeUri,
      name,
      preset: preset ?? get().selectedPreset ?? undefined,
      folderId,
    });
    const projects = [project, ...get().projects];
    persistState(projects, get().folders);
    set({projects});
    return project;
  },

  updateProject: (projectId, patch) => {
    const folders = get().folders;
    const folderIds = new Set(folders.map(folder => folder.id));
    const projects = get().projects.map(project => {
      if (project.id !== projectId) {
        return project;
      }
      const nextFolderId =
        patch.folderId === undefined ||
        patch.folderId === TRASH_FOLDER_ID ||
        folderIds.has(patch.folderId)
          ? patch.folderId
          : project.folderId;
      return {
        ...project,
        ...patch,
        folderId: nextFolderId,
        updatedAt: new Date().toISOString(),
      };
    });
    persistState(projects, folders);
    set({projects});
  },

  renameProject: (projectId, nextName) => {
    const name = nextName.trim();
    if (!name) {
      return;
    }
    const projects = get().projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            name,
            updatedAt: new Date().toISOString(),
          }
        : project,
    );
    persistState(projects, get().folders);
    set({projects});
  },

  deleteProject: projectId => {
    get().moveProjectToTrash(projectId);
  },

  moveProjectToTrash: projectId => {
    const folderIds = new Set(get().folders.map(folder => folder.id));
    const projects = get().projects.map(project => {
      if (project.id !== projectId || isProjectInTrash(project)) {
        return project;
      }
      const currentFolderId =
        project.folderId && folderIds.has(project.folderId) ? project.folderId : undefined;
      return {
        ...project,
        folderId: TRASH_FOLDER_ID,
        previousFolderId: currentFolderId,
        updatedAt: new Date().toISOString(),
      };
    });
    persistState(projects, get().folders);
    set({projects});
  },

  recoverProject: projectId => {
    const folderIds = new Set(get().folders.map(folder => folder.id));
    const projects = get().projects.map(project => {
      if (project.id !== projectId || !isProjectInTrash(project)) {
        return project;
      }
      const recoveredFolderId =
        project.previousFolderId && folderIds.has(project.previousFolderId)
          ? project.previousFolderId
          : undefined;
      return {
        ...project,
        folderId: recoveredFolderId,
        previousFolderId: undefined,
        updatedAt: new Date().toISOString(),
      };
    });
    persistState(projects, get().folders);
    set({projects});
  },

  removeProjectPermanently: projectId => {
    const projects = get().projects.filter(project => project.id !== projectId);
    persistState(projects, get().folders);
    set({projects});
  },

  cleanTrash: () => {
    const projects = get().projects.filter(project => !isProjectInTrash(project));
    persistState(projects, get().folders);
    set({projects});
  },

  moveProjectToFolder: (projectId, folderId) => {
    const folderIds = new Set(get().folders.map(folder => folder.id));
    if (!folderIds.has(folderId)) {
      return;
    }
    const projects = get().projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            folderId,
            previousFolderId: undefined,
            updatedAt: new Date().toISOString(),
          }
        : project,
    );
    persistState(projects, get().folders);
    set({projects});
  },

  duplicateProject: projectId => {
    const folders = get().folders;
    const folderIds = new Set(folders.map(folder => folder.id));
    const source = get().projects.find(project => project.id === projectId);
    if (!source) {
      return;
    }
    const destinationFolderId =
      source.folderId &&
      source.folderId !== TRASH_FOLDER_ID &&
      folderIds.has(source.folderId)
        ? source.folderId
        : undefined;
    const projects = [
      duplicateProject(source, {folderId: destinationFolderId}),
      ...get().projects,
    ];
    persistState(projects, folders);
    set({projects});
  },

  renameFolder: (folderId, nextName) => {
    const name = nextName.trim();
    if (!name) {
      return;
    }
    const folders = get().folders.map(folder =>
      folder.id === folderId
        ? {
            ...folder,
            name,
            updatedAt: new Date().toISOString(),
          }
        : folder,
    );
    persistState(get().projects, folders);
    set({folders});
  },

  removeFolder: folderId => {
    const folders = get().folders;
    if (!folders.some(folder => folder.id === folderId)) {
      return;
    }
    const nextFolders = folders.filter(folder => folder.id !== folderId);
    const fallbackFolderId = nextFolders[0]?.id;
    const projects = get().projects.map(project => {
      if (project.folderId === folderId) {
        return {
          ...project,
          folderId: fallbackFolderId,
          updatedAt: new Date().toISOString(),
        };
      }
      if (isProjectInTrash(project) && project.previousFolderId === folderId) {
        return {
          ...project,
          previousFolderId: fallbackFolderId,
        };
      }
      return project;
    });
    persistState(projects, nextFolders);
    set({projects, folders: nextFolders});
  },

  addExportBatch: (projectId, batch) => {
    const projects = get().projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            exports: [batch, ...project.exports],
            updatedAt: new Date().toISOString(),
          }
        : project,
    );
    persistState(projects, get().folders);
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
