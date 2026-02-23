export type FitMode = 'fit' | 'fill';

export type GridPreset = {
  columns: number;
  rows: number;
  id: string;
  label: string;
};

export type CropTransform = {
  scale: number;
  x: number;
  y: number;
  rotation: number;
  fitMode: FitMode;
};

export type TileResolution = 1080 | 2048 | number;

export const ALL_PROJECTS_FOLDER_ID = 'folder-all-projects';
export const TRASH_FOLDER_ID = 'folder-trash';

export type Folder = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ExportBatch = {
  id: string;
  projectId: string;
  createdAt: string;
  preset: GridPreset;
  tileResolution: TileResolution;
  tileUris: string[];
  postingOrder: number[];
  destination: 'photos' | 'files' | 'share';
  failedTiles?: number[];
};

export type Project = {
  id: string;
  name: string;
  imageUri: string;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  previousFolderId?: string;
  favorite: boolean;
  preset: GridPreset;
  tileResolution: TileResolution;
  numberOverlay: boolean;
  rotationEnabled: boolean;
  transform: CropTransform;
  exports: ExportBatch[];
  lastOpenedAt?: string;
  corrupted?: boolean;
};

export type LearnArticle = {
  id: string;
  title: string;
  content: string;
  keywords: string[];
};

export const GRID_PRESETS: GridPreset[] = [
  {id: '3x3', label: '3×3', columns: 3, rows: 3},
  {id: '3x4', label: '3×4', columns: 3, rows: 4},
  {id: '3x5', label: '3×5', columns: 3, rows: 5},
  {id: '3x6', label: '3×6', columns: 3, rows: 6},
  {id: '4x4', label: '4×4', columns: 4, rows: 4},
];

export const DEFAULT_PRESET = GRID_PRESETS[1];

export const DEFAULT_TRANSFORM: CropTransform = {
  scale: 1,
  x: 0,
  y: 0,
  rotation: 0,
  fitMode: 'fill',
};

export const isProjectInTrash = (project: Pick<Project, 'folderId'>) =>
  project.folderId === TRASH_FOLDER_ID;
