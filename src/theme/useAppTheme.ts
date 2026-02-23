import {useColorScheme} from 'react-native';
import {getTheme} from './tokens';

export const useAppTheme = () => {
  const scheme = useColorScheme();
  return getTheme(scheme);
};
