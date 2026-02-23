import AsyncStorage from '@react-native-async-storage/async-storage';
import {Project} from '../types/models';

const PROJECTS_KEY = 'gridly.projects.v1';

export const projectStorage = {
  async readProjects(): Promise<Project[]> {
    const raw = await AsyncStorage.getItem(PROJECTS_KEY);
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
  async writeProjects(projects: Project[]) {
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },
};
