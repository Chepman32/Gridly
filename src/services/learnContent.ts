import {LearnArticle} from '../types/models';

export const learnArticles: LearnArticle[] = [
  {
    id: 'posting-order',
    title: 'How posting order works',
    keywords: ['posting', 'order', 'top-left', 'instagram', 'sequence'],
    content:
      'New posts appear in the top-left of your profile grid. To reconstruct a mosaic correctly, post from the bottom-right tile backward until the top-left tile is posted last.',
  },
  {
    id: 'alignment-mistakes',
    title: 'Avoid alignment mistakes',
    keywords: ['alignment', 'crop', 'seam', 'quality'],
    content:
      'Use Fill mode when your image needs full bleed coverage. In Seam Inspect mode, verify key lines cross seams smoothly before exporting.',
  },
  {
    id: 'resolution',
    title: 'Recommended export sizes',
    keywords: ['resolution', '1080', 'quality', 'compression'],
    content:
      '1080 px tile size is recommended for compatibility and quality. Use 2048 for archival exports if storage and upload workflow allow it.',
  },
  {
    id: 'simulation',
    title: 'Profile simulation tips',
    keywords: ['simulation', 'preview', 'final'],
    content:
      'Use Simulation mode to validate composition before posting. Mark posted tiles to track progress and avoid sequence mistakes.',
  },
];
