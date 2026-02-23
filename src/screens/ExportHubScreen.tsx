import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScreenContainer} from '../components/ScreenContainer';
import {useAppStore} from '../state/useAppStore';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {formatDate} from '../utils/date';
import {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ExportHubScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const batches = useAppStore(state =>
    state.projects.flatMap(project =>
      project.exports.map(batch => ({batch, projectName: project.name, projectId: project.id})),
    ),
  );

  return (
    <ScreenContainer scroll>
      <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Export</Text>
      <Text style={[styles.caption, {color: theme.colors.textSecondary}]}>Recent export batches</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {batches.length ? (
          batches.map(item => (
            <Pressable
              key={item.batch.id}
              onPress={() => navigation.navigate('Export', {projectId: item.projectId})}
              style={[styles.row, {borderColor: theme.colors.separator}]}> 
              <Text style={[styles.rowTitle, {color: theme.colors.textPrimary}]}>
                {item.projectName} · {item.batch.preset.label}
              </Text>
              <Text style={[styles.rowSub, {color: theme.colors.textSecondary}]}> 
                {formatDate(item.batch.createdAt)} · {item.batch.tileUris.length} tiles · {item.batch.destination}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={[styles.caption, {marginTop: tokens.spacing.s2, color: theme.colors.textSecondary}]}>No exports yet.</Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...tokens.typography.title1,
  },
  caption: {
    ...tokens.typography.footnote,
    marginTop: 6,
  },
  list: {
    marginTop: tokens.spacing.s2,
    gap: tokens.spacing.s1,
    paddingBottom: tokens.spacing.s5,
  },
  row: {
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.s2,
    gap: 4,
  },
  rowTitle: {
    ...tokens.typography.headline,
  },
  rowSub: {
    ...tokens.typography.subhead,
  },
});
