/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({children}: {children: React.ReactNode}) => children,
  GestureDetector: ({children}: {children: React.ReactNode}) => children,
  Gesture: {
    Pan: () => ({onStart: () => ({}), onUpdate: () => ({}), onEnd: () => ({})}),
    Pinch: () => ({onStart: () => ({}), onUpdate: () => ({}), onEnd: () => ({})}),
    Rotation: () => ({onUpdate: () => ({})}),
    Tap: () => ({numberOfTaps: () => ({onEnd: () => ({})})}),
    Simultaneous: () => ({}),
    Race: () => ({}),
  },
}));

jest.mock('react-native-reanimated', () => {
  const ReactLocal = require('react');
  return {
    __esModule: true,
    default: {
      View: ({children}: {children: React.ReactNode}) =>
        ReactLocal.createElement(ReactLocal.Fragment, null, children),
      Text: ({children}: {children: React.ReactNode}) =>
        ReactLocal.createElement(ReactLocal.Fragment, null, children),
    },
    FadeIn: {duration: () => ({delay: () => ({})}), delay: () => ({duration: () => ({})})},
    useSharedValue: (value: unknown) => ({value}),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  DefaultTheme: {},
  DarkTheme: {},
  useNavigation: () => ({navigate: jest.fn()}),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: () => null,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: () => null,
  }),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-document-picker', () => ({
  pickSingle: jest.fn(),
  isCancel: jest.fn(),
  types: {images: 'images'},
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/tmp',
  exists: jest.fn(async () => true),
  mkdir: jest.fn(async () => undefined),
  writeFile: jest.fn(async () => undefined),
  copyFile: jest.fn(async () => undefined),
}));

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {save: jest.fn(async () => 'ok')},
}));

jest.mock('react-native-share', () => ({
  open: jest.fn(async () => undefined),
}));

jest.mock('react-native-zip-archive', () => ({
  zip: jest.fn(async () => '/tmp/tiles.zip'),
}));

jest.mock('react-native-photo-manipulator', () => ({
  crop: jest.fn(async () => '/tmp/tile.jpg'),
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
