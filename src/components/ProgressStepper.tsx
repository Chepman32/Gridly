import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {ExportStage} from '../services/exportService';

const stages: ExportStage[] = ['preparing', 'rendering', 'writing', 'done'];
const labels: Record<ExportStage, string> = {
  preparing: 'Preparing',
  rendering: 'Rendering tiles',
  writing: 'Writing output',
  done: 'Done',
  failed: 'Failed',
};

type Props = {
  stage: ExportStage;
  details?: string;
};

export const ProgressStepper = ({stage, details}: Props) => {
  const theme = useAppTheme();
  return (
    <View style={styles.root}>
      {stages.map(item => {
        const current = stages.indexOf(stage);
        const idx = stages.indexOf(item);
        const complete = idx <= current;
        return (
          <View key={item} style={styles.row}>
            <View
              style={[
                styles.dot,
                {backgroundColor: complete ? theme.colors.brandPrimary : theme.colors.separator},
              ]}
            />
            <Text style={[styles.label, {color: theme.colors.textPrimary}]}>{labels[item]}</Text>
          </View>
        );
      })}
      {details ? <Text style={[styles.details, {color: theme.colors.textSecondary}]}>{details}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: tokens.spacing.s1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.s1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    ...tokens.typography.subhead,
  },
  details: {
    ...tokens.typography.footnote,
    marginTop: tokens.spacing.s1,
  },
});
