import React from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {useColorScheme} from 'react-native';
import {RootStackParamList, MainTabsParamList} from './types';
import {SplashScreen} from '../screens/SplashScreen';
import {ProjectsScreen} from '../screens/ProjectsScreen';
import {CreateScreen} from '../screens/CreateScreen';
import {ExportHubScreen} from '../screens/ExportHubScreen';
import {LearnScreen} from '../screens/LearnScreen';
import {EditorScreen} from '../screens/EditorScreen';
import {PreviewScreen} from '../screens/PreviewScreen';
import {ExportScreen} from '../screens/ExportScreen';
import {ProjectDetailsScreen} from '../screens/ProjectDetailsScreen';
import {tokens} from '../theme/tokens';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabsParamList>();

const TabNavigator = () => {
  const dark = useColorScheme() === 'dark';
  return (
    <Tabs.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
        },
        tabBarActiveTintColor: tokens.color.brand.primary,
        tabBarInactiveTintColor: dark ? '#8D90A0' : '#8A8E9E',
        tabBarIcon: ({color, size}) => {
          const iconName =
            route.name === 'Projects'
              ? 'grid-outline'
              : route.name === 'Create'
              ? 'add-circle-outline'
              : route.name === 'ExportHub'
              ? 'download-outline'
              : 'book-outline';
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}>
      <Tabs.Screen name="Projects" component={ProjectsScreen} options={{title: 'Projects'}} />
      <Tabs.Screen name="Create" component={CreateScreen} options={{title: 'Create'}} />
      <Tabs.Screen name="ExportHub" component={ExportHubScreen} options={{title: 'Export'}} />
      <Tabs.Screen name="Learn" component={LearnScreen} options={{title: 'Learn'}} />
    </Tabs.Navigator>
  );
};

export const AppNavigator = () => {
  const dark = useColorScheme() === 'dark';
  return (
    <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
      <RootStack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          animation: 'slide_from_right',
        }}>
        <RootStack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="Editor"
          component={EditorScreen}
          options={{headerShown: false}}
        />
        <RootStack.Screen name="Preview" component={PreviewScreen} options={{title: 'Preview'}} />
        <RootStack.Screen name="Export" component={ExportScreen} options={{title: 'Export'}} />
        <RootStack.Screen
          name="ProjectDetails"
          component={ProjectDetailsScreen}
          options={{title: 'Project Details'}}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
