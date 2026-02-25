import React from 'react';
import {Alert, Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '../components/PrimaryButton';
import {SecondaryButton} from '../components/SecondaryButton';
import {ProgressStepper} from '../components/ProgressStepper';
import {ScreenContainer} from '../components/ScreenContainer';
import {exportTiles, ExportStage} from '../services/exportService';
import {RootStackParamList} from '../navigation/types';
import {useAppStore} from '../state/useAppStore';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {formatDate} from '../utils/date';
import {isProjectInTrash} from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Export'>;

export const ExportScreen = ({route}: Props) => {
  const theme = useAppTheme();
  const allProjects = useAppStore(state => state.projects);
  const projects = React.useMemo(
    () => allProjects.filter(project => !isProjectInTrash(project)),
    [allProjects],
  );
  const addBatch = useAppStore(state => state.addExportBatch);
  const project = React.useMemo(() => {
    if (route.params?.projectId) {
      return projects.find(item => item.id === route.params.projectId);
    }
    return projects[0];
  }, [projects, route.params?.projectId]);

  const [stage, setStage] = React.useState<ExportStage>('preparing');
  const [progressDetails, setProgressDetails] = React.useState('Idle');
  const [running, setRunning] = React.useState(false);

  if (!project) {
    return (
      <ScreenContainer>
        <Text style={{color: theme.colors.textPrimary}}>No projects available for export.</Text>
      </ScreenContainer>
    );
  }

  const totalTiles = project.preset.columns * project.preset.rows;
  const estimatedSize = ((totalTiles * project.tileResolution * 0.22) / 1024).toFixed(1);

  const run = async (destination: 'photos' | 'share') => {
    try {
      setRunning(true);
      const batch = await exportTiles(project, destination, progress => {
        setStage(progress.stage);
        if (progress.index && progress.total) {
          setProgressDetails(`Rendering tile ${progress.index} of ${progress.total}`);
        } else if (progress.message) {
          setProgressDetails(progress.message);
        } else {
          setProgressDetails(progress.stage);
        }
      });
      await addBatch(project.id, batch);
      Alert.alert('Export complete', 'Tiles were exported successfully.');
    } catch (error) {
      setStage('failed');
      const message =
        error instanceof Error ? error.message : 'Could not finish export.';

      if (message.includes('Photo library permission')) {
        setProgressDetails('Photos access denied. Enable Photos access in iOS Settings.');
        Alert.alert(
          'Photos permission required',
          'Enable Photos access for Gridly in iOS Settings, then try again.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => Linking.openSettings()},
          ],
        );
      } else {
        setProgressDetails('Export failed. You can retry or use ZIP sharing as fallback.');
        Alert.alert('Export failed', `${message} Try Share as ZIP as fallback.`);
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Export</Text>
      <View style={[styles.summary, {borderColor: theme.colors.separator}]}> 
        <Text style={[styles.summaryText, {color: theme.colors.textPrimary}]}> 
          {project.preset.label} · {totalTiles} tiles · {project.tileResolution}px · ~{estimatedSize} MB
        </Text>
      </View>

      <PrimaryButton label="Save All to Photos" onPress={() => run('photos')} loading={running} />
      <View style={styles.buttonGap}>
        <SecondaryButton label="Share as ZIP" onPress={() => run('share')} />
      </View>

      <View style={[styles.progress, {borderColor: theme.colors.separator}]}> 
        <Text style={[styles.progressTitle, {color: theme.colors.textPrimary}]}>Progress</Text>
        <ProgressStepper stage={stage} details={progressDetails} />
      </View>

      <Text style={[styles.section, {color: theme.colors.textSecondary}]}>Recent Exports</Text>
      <ScrollView contentContainerStyle={styles.historyList}>
        {project.exports.length ? (
          project.exports.map(batch => (
            <View key={batch.id} style={[styles.row, {borderColor: theme.colors.separator}]}> 
              <Text style={[styles.rowTitle, {color: theme.colors.textPrimary}]}> 
                {formatDate(batch.createdAt)} · {batch.tileUris.length} tiles
              </Text>
              <Text style={[styles.rowSub, {color: theme.colors.textSecondary}]}>Destination: {batch.destination}</Text>
            </View>
          ))
        ) : (
          <Text style={[styles.rowSub, {color: theme.colors.textSecondary}]}>No export history yet.</Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...tokens.typography.title1,
    marginBottom: tokens.spacing.s2,
  },
  summary: {
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.s2,
    marginBottom: tokens.spacing.s2,
  },
  summaryText: {
    ...tokens.typography.callout,
  },
  buttonGap: {
    marginTop: tokens.spacing.s1,
  },
  progress: {
    marginTop: tokens.spacing.s2,
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.s2,
    gap: tokens.spacing.s1,
  },
  progressTitle: {
    ...tokens.typography.headline,
  },
  section: {
    ...tokens.typography.footnote,
    marginTop: tokens.spacing.s2,
  },
  historyList: {
    marginTop: tokens.spacing.s1,
    gap: tokens.spacing.s1,
    paddingBottom: tokens.spacing.s5,
  },
  row: {
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.s2,
  },
  rowTitle: {
    ...tokens.typography.subhead,
    fontWeight: '600',
  },
  rowSub: {
    ...tokens.typography.footnote,
  },
});
