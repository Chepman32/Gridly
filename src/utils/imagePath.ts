import RNFS from 'react-native-fs';

/**
 * Strips the DocumentDirectoryPath prefix from an absolute file URI,
 * returning a relative path like "gridly/images/abc.jpg".
 * If the path is already relative (no DocumentDirectoryPath prefix), returns as-is.
 */
export const toRelativeImagePath = (uri: string): string => {
  const docDir = RNFS.DocumentDirectoryPath;

  // Handle file:// URIs
  if (uri.startsWith('file://')) {
    const decoded = decodeURIComponent(uri.replace(/^file:\/\//, ''));
    if (decoded.startsWith(docDir + '/')) {
      return decoded.slice(docDir.length + 1);
    }
    return uri;
  }

  // Handle bare absolute paths
  if (uri.startsWith(docDir + '/')) {
    return uri.slice(docDir.length + 1);
  }

  return uri;
};

/**
 * Resolves a relative image path to a full file:// URI for display.
 * If the path is already an absolute URI, returns as-is.
 */
export const resolveImageUri = (path: string): string => {
  if (!path) {
    return path;
  }

  // Already a full URI
  if (path.startsWith('file://') || path.startsWith('http')) {
    return path;
  }

  // Already an absolute path (starts with /)
  if (path.startsWith('/')) {
    return `file://${path}`;
  }

  // Relative path — resolve against DocumentDirectoryPath
  return `file://${RNFS.DocumentDirectoryPath}/${path}`;
};
