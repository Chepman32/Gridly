import {MMKV} from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Folder, GridPreset, Project} from '../types/models';

const PROJECTS_KEY = 'gridly.projects.v1';
const FOLDERS_KEY = 'gridly.folders.v1';
const CUSTOM_TEMPLATES_KEY = 'gridly.custom-templates.v1';
const MIGRATED_KEY = 'gridly.migrated-from-async';

const mmkv = new MMKV({id: 'gridly-storage'});

const safeSet = (key: string, value: string | boolean) => {
  try {
    mmkv.set(key, value);
    return true;
  } catch {
    return false;
  }
};

/**
 * One-time migration from AsyncStorage to MMKV.
 * Copies projects and folders data, then marks migration as done.
 */
export const migrateFromAsyncStorage = async (): Promise<void> => {
  if (mmkv.getBoolean(MIGRATED_KEY)) {
    return;
  }

  try {
    const [projectsRaw, foldersRaw] = await Promise.all([
      AsyncStorage.getItem(PROJECTS_KEY),
      AsyncStorage.getItem(FOLDERS_KEY),
    ]);

    if (projectsRaw && !mmkv.getString(PROJECTS_KEY)) {
      safeSet(PROJECTS_KEY, projectsRaw);
    }
    if (foldersRaw && !mmkv.getString(FOLDERS_KEY)) {
      safeSet(FOLDERS_KEY, foldersRaw);
    }
  } catch {
    // AsyncStorage may not exist or be empty — that's fine
  }

  safeSet(MIGRATED_KEY, true);
};

export const projectStorage = {
  readProjects(): Project[] {
    const raw = mmkv.getString(PROJECTS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as Project[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  writeProjects(projects: Project[]) {
    safeSet(PROJECTS_KEY, JSON.stringify(projects));
  },

  readFolders(): Folder[] {
    const raw = mmkv.getString(FOLDERS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as Folder[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  writeFolders(folders: Folder[]) {
    safeSet(FOLDERS_KEY, JSON.stringify(folders));
  },

  readCustomTemplates(): GridPreset[] {
    const raw = mmkv.getString(CUSTOM_TEMPLATES_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as GridPreset[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  writeCustomTemplates(customTemplates: GridPreset[]) {
    safeSet(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
  },
};
