import {DEFAULT_PRESET, DEFAULT_TRANSFORM, GridPreset, Project} from '../types/models';
import {makeId} from '../utils/id';

export const createProject = (params: {
  imageUri: string;
  name?: string;
  preset?: GridPreset;
}): Project => {
  const now = new Date().toISOString();
  return {
    id: makeId('project'),
    name: params.name ?? `Project ${new Date().toLocaleDateString()}`,
    imageUri: params.imageUri,
    createdAt: now,
    updatedAt: now,
    favorite: false,
    preset: params.preset ?? DEFAULT_PRESET,
    tileResolution: 1080,
    numberOverlay: true,
    rotationEnabled: false,
    transform: DEFAULT_TRANSFORM,
    exports: [],
  };
};

export const duplicateProject = (project: Project): Project => {
  const now = new Date().toISOString();
  return {
    ...project,
    id: makeId('project'),
    name: `${project.name} Copy`,
    createdAt: now,
    updatedAt: now,
    exports: [],
  };
};
