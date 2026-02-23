import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen = ({navigation}: Props) => {
  const theme = useAppTheme();
  const scale = useSharedValue(0.7);

  React.useEffect(() => {
    scale.value = withSpring(1, tokens.motion.spring.snappy);
    const id = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 1300);
    return () => clearTimeout(id);
  }, [navigation, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <View style={[styles.root, {backgroundColor: theme.colors.background}]}> 
      <Animated.View entering={FadeIn.duration(tokens.motion.timing.normal)} style={style}>
        <View style={styles.grid}>
          {Array.from({length: 9}).map((_, idx) => (
            <Animated.View
              key={idx}
              entering={FadeIn.delay(idx * 35).duration(tokens.motion.timing.fast)}
              style={[styles.cell, {backgroundColor: theme.colors.brandPrimary}]}
            />
          ))}
        </View>
      </Animated.View>
      <Animated.Text
        entering={FadeIn.delay(300).duration(tokens.motion.timing.normal)}
        style={[styles.title, {color: theme.colors.textPrimary}]}>
        GRIDLY
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.s3,
  },
  grid: {
    width: 102,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  title: {
    letterSpacing: 4,
    ...tokens.typography.title2,
  },
});
