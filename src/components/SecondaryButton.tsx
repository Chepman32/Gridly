import React from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import {useAppTheme} from '../theme/useAppTheme';
import {tokens} from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export const SecondaryButton = ({label, onPress, style}: Props) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        {
          borderColor: theme.colors.separator,
          backgroundColor: pressed ? theme.colors.separator : 'transparent',
        },
        style,
      ]}>
      <Text style={[styles.label, {color: theme.colors.textPrimary}]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: tokens.tapTargetMin,
    borderRadius: tokens.radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.s2,
  },
  label: {
    ...tokens.typography.callout,
    fontWeight: '600',
  },
});
