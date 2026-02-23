import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppNavigator} from './src/navigation/AppNavigator';
import {useAppStore} from './src/state/useAppStore';
import {useAppTheme} from './src/theme/useAppTheme';

function App() {
  const theme = useAppTheme();
  const load = useAppStore(state => state.load);
  const loaded = useAppStore(state => state.loaded);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (!loaded) {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.background,
            }}>
            <ActivityIndicator color={theme.colors.brandPrimary} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
