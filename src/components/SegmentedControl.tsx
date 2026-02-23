import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';

type Props<T extends string> = {
  options: T[];
  selected: T;
  onChange: (value: T) => void;
};

export const SegmentedControl = <T extends string>({
  options,
  selected,
  onChange,
}: Props<T>) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, {borderColor: theme.colors.separator}]}> 
      {options.map(option => {
        const active = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.segment,
              {backgroundColor: active ? theme.colors.brandPrimary : 'transparent'},
            ]}>
            <Text
              style={[
                styles.label,
                {color: active ? '#fff' : theme.colors.textSecondary},
              ]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    minHeight: tokens.tapTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...tokens.typography.subhead,
    fontWeight: '600',
  },
});
