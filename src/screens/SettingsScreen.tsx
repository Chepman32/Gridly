import React from 'react';
import {Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import {ScreenContainer} from '../components/ScreenContainer';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';

export const SettingsScreen = () => {
  const theme = useAppTheme();
  const [highQualityExport, setHighQualityExport] = React.useState(true);
  const [savePreviewState, setSavePreviewState] = React.useState(true);

  return (
    <ScreenContainer scroll>
      <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Settings</Text>

      <View style={[styles.section, {borderColor: theme.colors.separator}]}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, {color: theme.colors.textPrimary}]}>
              High quality exports
            </Text>
            <Text style={[styles.rowSub, {color: theme.colors.textSecondary}]}>
              Prefer 2048 when available.
            </Text>
          </View>
          <Switch value={highQualityExport} onValueChange={setHighQualityExport} />
        </View>

        <View style={[styles.divider, {backgroundColor: theme.colors.separator}]} />

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, {color: theme.colors.textPrimary}]}>
              Keep preview state
            </Text>
            <Text style={[styles.rowSub, {color: theme.colors.textSecondary}]}>
              Remember zoom and pan between sessions.
            </Text>
          </View>
          <Switch value={savePreviewState} onValueChange={setSavePreviewState} />
        </View>
      </View>

      <Pressable style={[styles.secondaryCard, {borderColor: theme.colors.separator}]}>
        <Text style={[styles.secondaryTitle, {color: theme.colors.textPrimary}]}>Version</Text>
        <Text style={[styles.secondarySub, {color: theme.colors.textSecondary}]}>0.0.1</Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...tokens.typography.title1,
    marginBottom: tokens.spacing.s2,
  },
  section: {
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    overflow: 'hidden',
  },
  row: {
    minHeight: 64,
    paddingHorizontal: tokens.spacing.s2,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.s1,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    ...tokens.typography.subhead,
    fontWeight: '600',
  },
  rowSub: {
    ...tokens.typography.footnote,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: tokens.spacing.s2,
  },
  secondaryCard: {
    marginTop: tokens.spacing.s2,
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.s2,
  },
  secondaryTitle: {
    ...tokens.typography.subhead,
    fontWeight: '600',
  },
  secondarySub: {
    ...tokens.typography.footnote,
    marginTop: 2,
  },
});
