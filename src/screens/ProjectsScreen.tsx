import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {ScreenContainer} from '../components/ScreenContainer';
import {ProjectCard} from '../components/ProjectCard';
import {EmptyState} from '../components/EmptyState';
import {useAppStore} from '../state/useAppStore';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {MainTabsParamList, RootStackParamList} from '../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Projects'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const ProjectsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const projects = useAppStore(state => state.projects);
  const deleteProject = useAppStore(state => state.deleteProject);
  const updateProject = useAppStore(state => state.updateProject);
  const favoriteProjects = React.useMemo(
    () => projects.filter(project => project.favorite).slice(0, 6),
    [projects],
  );
  const openCreateTab = React.useCallback(() => {
    navigation.navigate('Create');
  }, [navigation]);

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Projects</Text>
        <View style={styles.headerActions}>
          <Pressable accessibilityLabel="Settings" style={styles.iconBtn}>
            <Icon name="settings-outline" size={22} color={theme.colors.textPrimary} />
          </Pressable>
          <Pressable accessibilityLabel="Select" style={styles.iconBtn}>
            <Text style={[styles.selectText, {color: theme.colors.brandPrimary}]}>Select</Text>
          </Pressable>
        </View>
      </View>

      {projects.length === 0 ? (
        <EmptyState
          title="Create your first grid"
          subtitle="Import one photo, align it once, then export perfectly ordered tiles."
          actionLabel="New Project"
          onAction={openCreateTab}
        />
      ) : (
        <>
          <Text style={[styles.section, {color: theme.colors.textSecondary}]}>Recent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {(favoriteProjects.length ? favoriteProjects : projects.slice(0, 6)).map(project => (
              <View key={`recent-${project.id}`} style={styles.recentCard}>
                <ProjectCard
                  project={project}
                  onPress={() => navigation.navigate('Editor', {projectId: project.id})}
                  onToggleFavorite={() =>
                    updateProject(project.id, {favorite: !project.favorite})
                  }
                />
              </View>
            ))}
          </ScrollView>

          <Text style={[styles.section, {color: theme.colors.textSecondary}]}>All Projects</Text>
          <FlatList
            data={projects}
            numColumns={2}
            keyExtractor={item => item.id}
            columnWrapperStyle={styles.columns}
            contentContainerStyle={styles.listContent}
            renderItem={({item}) => (
              <View style={styles.columnCard}>
                <ProjectCard
                  project={item}
                  onPress={() => navigation.navigate('Editor', {projectId: item.id})}
                  onToggleFavorite={() => updateProject(item.id, {favorite: !item.favorite})}
                />
                <View style={styles.quickRow}>
                  <Pressable
                    onPress={() => navigation.navigate('Export', {projectId: item.id})}
                    style={[styles.quickBtn, {borderColor: theme.colors.separator}]}> 
                    <Text style={[styles.quickText, {color: theme.colors.textSecondary}]}>Export</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      Alert.alert('Delete project', 'This action cannot be undone.', [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => deleteProject(item.id),
                        },
                      ])
                    }
                    style={[styles.quickBtn, {borderColor: theme.colors.separator}]}> 
                    <Text style={[styles.quickText, {color: theme.colors.error}]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </>
      )}

      {projects.length > 0 ? (
        <Pressable
          onPress={openCreateTab}
          style={[styles.floatingCta, {backgroundColor: theme.colors.brandPrimary}]}>
          <Text style={styles.floatingLabel}>+ New Project</Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.s2,
  },
  title: {
    ...tokens.typography.title1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.s1,
  },
  iconBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectText: {
    ...tokens.typography.callout,
    fontWeight: '600',
  },
  section: {
    ...tokens.typography.footnote,
    marginBottom: tokens.spacing.s1,
    marginTop: tokens.spacing.s1,
  },
  recentRow: {
    gap: tokens.spacing.s2,
    paddingBottom: tokens.spacing.s1,
  },
  recentCard: {
    width: 180,
  },
  columns: {
    gap: tokens.spacing.s2,
  },
  columnCard: {
    flex: 1,
    gap: tokens.spacing.s1,
  },
  listContent: {
    paddingBottom: 120,
    gap: tokens.spacing.s2,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  quickText: {
    ...tokens.typography.caption2,
    fontWeight: '600',
  },
  floatingCta: {
    position: 'absolute',
    bottom: tokens.spacing.s3,
    alignSelf: 'center',
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: tokens.spacing.s3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingLabel: {
    color: '#fff',
    ...tokens.typography.headline,
  },
});
