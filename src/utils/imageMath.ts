import {CropTransform} from '../types/models';

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const snapToZero = (value: number, threshold = 2) =>
  Math.abs(value) <= threshold ? 0 : value;

export const getFitTransform = (): CropTransform => ({
  scale: 1,
  x: 0,
  y: 0,
  rotation: 0,
  fitMode: 'fit',
});

export const getFillTransform = (): CropTransform => ({
  scale: 1.08,
  x: 0,
  y: 0,
  rotation: 0,
  fitMode: 'fill',
});
