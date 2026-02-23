import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAppTheme} from '../theme/useAppTheme';
import {tokens} from '../theme/tokens';
import {PrimaryButton} from './PrimaryButton';

type Props = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({title, subtitle, actionLabel, onAction}: Props) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.root, {borderColor: theme.colors.separator}]}> 
      <Icon name="grid-outline" size={28} color={theme.colors.brandPrimary} />
      <Text style={[styles.title, {color: theme.colors.textPrimary}]}>{title}</Text>
      <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: tokens.radius.l,
    padding: tokens.spacing.s3,
    alignItems: 'center',
    gap: tokens.spacing.s1,
  },
  title: {
    ...tokens.typography.title3,
    textAlign: 'center',
  },
  subtitle: {
    ...tokens.typography.callout,
    textAlign: 'center',
  },
  button: {
    marginTop: tokens.spacing.s2,
    minWidth: 180,
  },
});
