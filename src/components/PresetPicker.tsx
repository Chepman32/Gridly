import React from 'react';
import {ScrollView, Pressable, StyleSheet, Text} from 'react-native';
import {GRID_PRESETS, GridPreset} from '../types/models';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';

type Props = {
  presets?: GridPreset[];
  selected: GridPreset;
  onSelect: (preset: GridPreset) => void;
};

export const PresetPicker = ({presets = GRID_PRESETS, selected, onSelect}: Props) => {
  const theme = useAppTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {presets.map(preset => {
        const active = selected.id === preset.id;
        return (
          <Pressable
            key={preset.id}
            onPress={() => onSelect(preset)}
            style={({pressed}) => [
              styles.chip,
              {
                borderColor: active ? theme.colors.brandPrimary : theme.colors.separator,
                backgroundColor: active
                  ? `${theme.colors.brandPrimary}1A`
                  : pressed
                  ? theme.colors.separator
                  : 'transparent',
              },
            ]}>
            <Text
              style={[
                styles.label,
                {color: active ? theme.colors.brandPrimary : theme.colors.textPrimary},
              ]}>
              {preset.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {gap: tokens.spacing.s1},
  chip: {
    minHeight: tokens.tapTargetMin,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.s2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...tokens.typography.subhead,
    fontWeight: '600',
  },
});
