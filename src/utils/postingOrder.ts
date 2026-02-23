import {GridPreset} from '../types/models';

export type TilePosition = {
  index: number;
  row: number;
  column: number;
};

export const buildTilePositions = (preset: GridPreset): TilePosition[] => {
  const positions: TilePosition[] = [];
  let index = 1;
  for (let row = 1; row <= preset.rows; row += 1) {
    for (let column = 1; column <= preset.columns; column += 1) {
      positions.push({index, row, column});
      index += 1;
    }
  }
  return positions;
};

export const buildPostingOrder = (preset: GridPreset): number[] => {
  const order: number[] = [];
  for (let row = preset.rows; row >= 1; row -= 1) {
    for (let col = preset.columns; col >= 1; col -= 1) {
      order.push((row - 1) * preset.columns + col);
    }
  }
  return order;
};
