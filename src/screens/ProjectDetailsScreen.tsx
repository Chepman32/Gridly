import React from 'react';
import {Alert, Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '../components/ScreenContainer';
import {PresetPicker} from '../components/PresetPicker';
import {RootStackParamList} from '../navigation/types';
import {useAppStore} from '../state/useAppStore';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {formatDate} from '../utils/date';
import {SecondaryButton} from '../components/SecondaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectDetails'>;

export const ProjectDetailsScreen = ({route, navigation}: Props) => {
  const theme = useAppTheme();
  const project = useAppStore(state =>
    state.projects.find(item => item.id === route.params.projectId),
  );
  const updateProject = useAppStore(state => state.updateProject);
  const removeProject = useAppStore(state => state.deleteProject);
  const duplicate = useAppStore(state => state.duplicateProject);

  if (!project) {
    return (
      <ScreenContainer>
        <Text style={{color: theme.colors.textPrimary}}>Project not found.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, {backgroundColor: theme.colors.surface, borderColor: theme.colors.separator}]}> 
          <Image source={{uri: project.imageUri}} style={styles.thumb} />
          <View style={styles.heroMeta}>
            <Text style={[styles.title, {color: theme.colors.textPrimary}]}>{project.name}</Text>
            <Pressable onPress={() => updateProject(project.id, {favorite: !project.favorite})}>
              <Text style={[styles.favorite, {color: theme.colors.warning}]}>★ Favorite</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>Preset</Text>
        <PresetPicker selected={project.preset} onSelect={preset => updateProject(project.id, {preset})} />

        <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>Export History</Text>
        {project.exports.length ? (
          project.exports.map(batch => (
            <Pressable
              key={batch.id}
              style={[styles.historyRow, {borderColor: theme.colors.separator}]}
              onPress={() => navigation.navigate('Export', {projectId: project.id})}>
              <Text style={[styles.historyText, {color: theme.colors.textPrimary}]}>
                {formatDate(batch.createdAt)} · {batch.tileUris.length} tiles · {batch.destination}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={[styles.hint, {color: theme.colors.textSecondary}]}>No export history yet.</Text>
        )}

        <View style={styles.actionRow}>
          <SecondaryButton label="Duplicate" onPress={() => duplicate(project.id)} style={styles.actionBtn} />
          <SecondaryButton
            label="Reset Crop"
            onPress={() =>
              updateProject(project.id, {
                transform: {...project.transform, x: 0, y: 0, scale: 1, rotation: 0},
              })
            }
            style={styles.actionBtn}
          />
        </View>

        <SecondaryButton
          label="Delete"
          onPress={() =>
            Alert.alert('Delete project', 'This action cannot be undone.', [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  await removeProject(project.id);
                  navigation.goBack();
                },
              },
            ])
          }
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: tokens.spacing.s2,
    paddingBottom: 60,
  },
  hero: {
    borderWidth: 1,
    borderRadius: tokens.radius.l,
    padding: tokens.spacing.s2,
    flexDirection: 'row',
    gap: tokens.spacing.s2,
  },
  thumb: {
    width: 92,
    height: 92,
    borderRadius: tokens.radius.m,
  },
  heroMeta: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    ...tokens.typography.title3,
  },
  favorite: {
    ...tokens.typography.callout,
    fontWeight: '600',
  },
  sectionLabel: {
    ...tokens.typography.footnote,
  },
  historyRow: {
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.s2,
  },
  historyText: {
    ...tokens.typography.subhead,
  },
  hint: {
    ...tokens.typography.subhead,
  },
  actionRow: {
    flexDirection: 'row',
    gap: tokens.spacing.s1,
  },
  actionBtn: {
    flex: 1,
  },
});
