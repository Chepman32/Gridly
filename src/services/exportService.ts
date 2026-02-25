import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {zip} from 'react-native-zip-archive';
import {
  CameraRoll,
  iosReadGalleryPermission,
  iosRequestAddOnlyGalleryPermission,
} from '@react-native-camera-roll/camera-roll';
import PhotoManipulator from 'react-native-photo-manipulator';
import {Image, Platform} from 'react-native';
import {ExportBatch, Project} from '../types/models';
import {buildPostingOrder} from '../utils/postingOrder';
import {resolveImageUri} from '../utils/imagePath';
import {makeId} from '../utils/id';

export type ExportStage =
  | 'preparing'
  | 'rendering'
  | 'writing'
  | 'done'
  | 'failed';

export type ExportProgress = {
  stage: ExportStage;
  index?: number;
  total?: number;
  message?: string;
};

const ensureDirectory = async (path: string) => {
  const exists = await RNFS.exists(path);
  if (!exists) {
    await RNFS.mkdir(path);
  }
};

const normalizePath = (uri: string) =>
  uri.startsWith('file://') ? uri.replace('file://', '') : uri;

const hasPhotosAddPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return true;
  }

  const current = await iosReadGalleryPermission('addOnly');
  if (current === 'granted' || current === 'limited') {
    return true;
  }
  if (current === 'unavailable') {
    // If permission status cannot be determined, try the save flow directly.
    return true;
  }

  if (current === 'not-determined') {
    const requested = await iosRequestAddOnlyGalleryPermission();
    return requested === 'granted' || requested === 'limited';
  }

  return false;
};

const getImageSize = (uri: string): Promise<{width: number; height: number}> =>
  new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({width, height}),
      () => reject(new Error('Could not read image dimensions')),
    );
  });

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const tileFileName = (
  projectName: string,
  columns: number,
  rows: number,
  tileIndex: number,
) => {
  const safeName = projectName.replace(/[^a-z0-9_-]+/gi, '_');
  return `Gridly_${safeName}_${columns}x${rows}_Tile_${String(tileIndex).padStart(2, '0')}.jpg`;
};

export const exportTiles = async (
  project: Project,
  destination: 'photos' | 'files' | 'share',
  onProgress: (progress: ExportProgress) => void,
): Promise<ExportBatch> => {
  const total = project.preset.columns * project.preset.rows;
  onProgress({stage: 'preparing', total});

  const sourceUri = resolveImageUri(project.imageUri);
  const exportDir = `${RNFS.DocumentDirectoryPath}/gridly/exports/${project.id}/${Date.now()}`;
  await ensureDirectory(`${RNFS.DocumentDirectoryPath}/gridly`);
  await ensureDirectory(`${RNFS.DocumentDirectoryPath}/gridly/exports`);
  await ensureDirectory(`${RNFS.DocumentDirectoryPath}/gridly/exports/${project.id}`);
  await ensureDirectory(exportDir);

  const image = await getImageSize(sourceUri);
  const targetAspect = project.preset.columns / project.preset.rows;
  const imageAspect = image.width / image.height;

  const baseCropWidth =
    imageAspect > targetAspect ? image.height * targetAspect : image.width;
  const baseCropHeight =
    imageAspect > targetAspect ? image.height : image.width / targetAspect;

  const safeScale = clamp(project.transform.scale || 1, 0.5, 4);
  const cropWidth = baseCropWidth / safeScale;
  const cropHeight = baseCropHeight / safeScale;

  const centerX = image.width / 2;
  const centerY = image.height / 2;
  const offsetX = (project.transform.x / 300) * (baseCropWidth * 0.6);
  const offsetY = (project.transform.y / 300) * (baseCropHeight * 0.6);
  const cropX = clamp(centerX - cropWidth / 2 - offsetX, 0, image.width - cropWidth);
  const cropY = clamp(centerY - cropHeight / 2 - offsetY, 0, image.height - cropHeight);

  const tileWidth = Math.floor(cropWidth / project.preset.columns);
  const tileHeight = Math.floor(cropHeight / project.preset.rows);

  const tileUris: string[] = [];
  for (let index = 1; index <= total; index += 1) {
    onProgress({stage: 'rendering', index, total});
    const tileZero = index - 1;
    const col = tileZero % project.preset.columns;
    const row = Math.floor(tileZero / project.preset.columns);
    const fileName = tileFileName(
      project.name,
      project.preset.columns,
      project.preset.rows,
      index,
    );
    const outputPath = `${exportDir}/${fileName}`;
    const croppedUri = await PhotoManipulator.crop(sourceUri, {
      x: Math.floor(cropX + col * tileWidth),
      y: Math.floor(cropY + row * tileHeight),
      width: tileWidth,
      height: tileHeight,
    });
    const croppedPath = normalizePath(croppedUri);
    await RNFS.copyFile(croppedPath, outputPath);
    tileUris.push(`file://${outputPath}`);
  }

  if (destination === 'photos') {
    onProgress({stage: 'writing'});
    const permissionGranted = await hasPhotosAddPermission();
    if (!permissionGranted) {
      throw new Error('Photo library permission not granted');
    }
    for (const tileUri of tileUris) {
      await CameraRoll.save(tileUri, {type: 'photo'});
    }
  }

  if (destination === 'share') {
    onProgress({stage: 'writing', message: 'Creating ZIP archive'});
    const zipDir = `${RNFS.DocumentDirectoryPath}/gridly/zips`;
    await ensureDirectory(zipDir);
    const zipTarget = `${zipDir}/${project.id}_${Date.now()}.zip`;
    const zipPath = await zip(exportDir, zipTarget);
    await Share.open({url: `file://${normalizePath(zipPath)}`, failOnCancel: false});
  }

  if (destination === 'files') {
    await Share.open({
      urls: tileUris,
      failOnCancel: false,
      title: 'Export tiles',
    });
  }

  onProgress({stage: 'done'});

  return {
    id: makeId('export'),
    projectId: project.id,
    createdAt: new Date().toISOString(),
    preset: project.preset,
    tileResolution: project.tileResolution,
    tileUris,
    postingOrder: buildPostingOrder(project.preset),
    destination,
  };
};
