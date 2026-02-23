import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import {useAppTheme} from '../theme/useAppTheme';
import {tokens} from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export const PrimaryButton = ({
  label,
  onPress,
  disabled,
  loading,
  style,
}: Props) => {
  const theme = useAppTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={inactive}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        {
          backgroundColor: inactive
            ? theme.colors.separator
            : theme.colors.brandPrimary,
          transform: [{scale: pressed ? 0.98 : 1}],
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={theme.colors.backgroundSecondary} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: tokens.tapTargetMin,
    borderRadius: tokens.radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.s2,
  },
  label: {
    color: '#fff',
    ...tokens.typography.headline,
  },
});
