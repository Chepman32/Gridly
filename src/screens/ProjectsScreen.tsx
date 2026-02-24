import React from 'react';
import {type MenuAction} from '@react-native-menu/menu';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ScreenContainer} from '../components/ScreenContainer';
import {ProjectCard} from '../components/ProjectCard';
import {MainTabsParamList, RootStackParamList} from '../navigation/types';
import {useAppStore} from '../state/useAppStore';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {
  ALL_PROJECTS_FOLDER_ID,
  Folder,
  Project,
  TRASH_FOLDER_ID,
  isProjectInTrash,
} from '../types/models';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Projects'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type FolderSection = {
  id: string;
  name: string;
  kind: 'all' | 'regular' | 'trash';
  folder?: Folder;
  projects: Project[];
};

const isIos = Platform.OS === 'ios';
const MOVE_TO_FOLDER_PREFIX = 'move_to_folder:';

export const ProjectsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const projects = useAppStore(state => state.projects);
  const folders = useAppStore(state => state.folders);
  const updateProject = useAppStore(state => state.updateProject);
  const renameProject = useAppStore(state => state.renameProject);
  const duplicateProject = useAppStore(state => state.duplicateProject);
  const moveProjectToTrash = useAppStore(state => state.moveProjectToTrash);
  const recoverProject = useAppStore(state => state.recoverProject);
  const removeProjectPermanently = useAppStore(state => state.removeProjectPermanently);
  const cleanTrash = useAppStore(state => state.cleanTrash);
  const addFolder = useAppStore(state => state.addFolder);
  const moveProjectToFolder = useAppStore(state => state.moveProjectToFolder);
  const renameFolder = useAppStore(state => state.renameFolder);
  const removeFolder = useAppStore(state => state.removeFolder);

  const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({
    [ALL_PROJECTS_FOLDER_ID]: true,
  });
  const [pendingDelete, setPendingDelete] = React.useState<{
    projectId: string;
    mode: 'trash' | 'permanent';
  } | null>(null);

  const activeProjects = React.useMemo(
    () => projects.filter(project => !isProjectInTrash(project)),
    [projects],
  );
  const trashedProjects = React.useMemo(
    () => projects.filter(project => isProjectInTrash(project)),
    [projects],
  );

  React.useEffect(() => {
    setExpandedFolders(prev => {
      const next = {...prev};
      let changed = false;

      if (next[ALL_PROJECTS_FOLDER_ID] === undefined) {
        next[ALL_PROJECTS_FOLDER_ID] = true;
        changed = true;
      }

      for (const folder of folders) {
        if (next[folder.id] === undefined) {
          next[folder.id] = false;
          changed = true;
        }
      }

      if (trashedProjects.length > 0 && next[TRASH_FOLDER_ID] === undefined) {
        next[TRASH_FOLDER_ID] = false;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [folders, trashedProjects.length]);

  const sections = React.useMemo<FolderSection[]>(() => {
    const byFolder = new Map<string, Project[]>();
    for (const folder of folders) {
      byFolder.set(folder.id, []);
    }
    for (const project of activeProjects) {
      if (project.folderId && byFolder.has(project.folderId)) {
        byFolder.get(project.folderId)?.push(project);
      }
    }

    const regularSections: FolderSection[] = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      kind: 'regular',
      folder,
      projects: byFolder.get(folder.id) ?? [],
    }));

    const result: FolderSection[] = [
      {
        id: ALL_PROJECTS_FOLDER_ID,
        name: 'All Projects',
        kind: 'all',
        projects: activeProjects,
      },
      ...regularSections,
    ];

    if (trashedProjects.length > 0) {
      result.push({
        id: TRASH_FOLDER_ID,
        name: 'Trash',
        kind: 'trash',
        projects: trashedProjects,
      });
    }

    return result;
  }, [activeProjects, folders, trashedProjects]);

  const openCreateTab = React.useCallback(() => {
    navigation.navigate('Create');
  }, [navigation]);

  const promptForText = React.useCallback(
    (
      title: string,
      message: string,
      initialValue: string,
      onSubmit: (value: string) => void,
    ) => {
      if (!isIos) {
        Alert.alert(title, 'Rename is available on iOS in this build.');
        return;
      }

      Alert.prompt(
        title,
        message,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Save',
            onPress: (value?: string) => {
              const next = (value ?? '').trim();
              if (next.length > 0) {
                onSubmit(next);
              }
            },
          },
        ],
        'plain-text',
        initialValue,
      );
    },
    [],
  );

  const createAndMoveToFolder = React.useCallback(
    (project: Project) => {
      promptForText('New Folder', 'Enter a folder name.', '', value => {
        const folder = addFolder(value);
        if (folder) {
          moveProjectToFolder(project.id, folder.id);
        }
      });
    },
    [addFolder, moveProjectToFolder, promptForText],
  );

  const projectActions = React.useCallback(
    (project: Project): MenuAction[] => {
      if (isProjectInTrash(project)) {
        return [
          {
            id: 'recover',
            title: 'Recover',
            image: 'arrow.uturn.backward',
          },
          {
            id: 'remove_permanently',
            title: 'Remove Permanently',
            image: 'trash',
            attributes: {destructive: true},
          },
        ];
      }

      const moveTargets = folders.filter(folder => folder.id !== project.folderId);
      const moveToFolderAction: MenuAction =
        moveTargets.length > 0
          ? {
              id: 'move_to_folder',
              title: 'Move to Folder',
              image: 'folder',
              subactions: moveTargets.map(folder => ({
                id: `${MOVE_TO_FOLDER_PREFIX}${folder.id}`,
                title: folder.name,
                image: 'folder',
              })),
            }
          : {
              id: 'move_to_folder_create',
              title: 'Move to Folder',
              image: 'folder.badge.plus',
            };

      return [
        {
          id: 'rename',
          title: 'Rename',
          image: 'pencil',
        },
        {
          id: 'duplicate',
          title: 'Duplicate',
          image: 'plus.square.on.square',
        },
        moveToFolderAction,
        {
          id: 'remove',
          title: 'Remove',
          image: 'trash',
          attributes: {destructive: true},
        },
      ];
    },
    [folders],
  );

  const handleProjectMenuAction = React.useCallback(
    (project: Project, actionId: string) => {
      if (actionId === 'rename') {
        promptForText('Rename Project', 'Enter a new project name.', project.name, value => {
          renameProject(project.id, value);
        });
        return;
      }

      if (actionId === 'duplicate') {
        duplicateProject(project.id);
        return;
      }

      if (actionId === 'remove') {
        Alert.alert('Move to Trash', 'You can recover this project later from Trash.', [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Move',
            style: 'destructive',
            onPress: () => {
              setPendingDelete({projectId: project.id, mode: 'trash'});
            },
          },
        ]);
        return;
      }

      if (actionId === 'recover') {
        recoverProject(project.id);
        return;
      }

      if (actionId === 'remove_permanently') {
        Alert.alert('Remove permanently', 'This project will be deleted forever.', [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              setPendingDelete({projectId: project.id, mode: 'permanent'});
            },
          },
        ]);
        return;
      }

      if (actionId === 'move_to_folder_create') {
        createAndMoveToFolder(project);
        return;
      }

      if (actionId.startsWith(MOVE_TO_FOLDER_PREFIX)) {
        const targetFolderId = actionId.slice(MOVE_TO_FOLDER_PREFIX.length);
        if (targetFolderId) {
          moveProjectToFolder(project.id, targetFolderId);
        }
      }
    },
    [
      createAndMoveToFolder,
      duplicateProject,
      moveProjectToFolder,
      promptForText,
      recoverProject,
      renameProject,
    ],
  );

  const toggleAccordion = React.useCallback((sectionId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const folderActions = React.useCallback((section: FolderSection): MenuAction[] => {
    if (section.kind === 'trash') {
      return [
        {
          id: 'clean_trash',
          title: 'Clean Trash',
          image: 'trash',
          attributes: {destructive: true},
        },
      ];
    }

    if (section.kind === 'regular') {
      return [
        {
          id: 'remove_folder',
          title: 'Remove',
          image: 'trash',
          attributes: {destructive: true},
        },
        {
          id: 'rename_folder',
          title: 'Rename',
          image: 'pencil',
        },
      ];
    }

    return [];
  }, []);

  const handleFolderMenuAction = React.useCallback(
    (section: FolderSection, actionId: string) => {
      if (actionId === 'clean_trash') {
        Alert.alert('Clean Trash', 'Remove all projects from Trash permanently?', [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Clean',
            style: 'destructive',
            onPress: () => {
              cleanTrash();
            },
          },
        ]);
        return;
      }

      if (!section.folder) {
        return;
      }

      if (actionId === 'rename_folder') {
        promptForText('Rename Folder', 'Enter a new folder name.', section.folder.name, value => {
          renameFolder(section.folder?.id ?? '', value);
        });
        return;
      }

      if (actionId === 'remove_folder') {
        const fallback = folders.find(folder => folder.id !== section.folder?.id);
        Alert.alert(
          'Remove Folder',
          `Projects in this folder will move to "${fallback?.name ?? 'All Projects'}".`,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Remove',
              style: 'destructive',
              onPress: () => {
                removeFolder(section.folder?.id ?? '');
              },
            },
          ],
        );
      }
    },
    [cleanTrash, folders, promptForText, removeFolder, renameFolder],
  );

  const showFolderActions = React.useCallback(
    (section: FolderSection) => {
      const actions = folderActions(section);
      if (!actions.length) {
        return;
      }
      Alert.alert(
        section.name,
        undefined,
        [
          ...actions.map(action => ({
            text: action.title,
            style: action.attributes?.destructive ? 'destructive' : 'default',
            onPress: () => {
              if (action.id) {
                handleFolderMenuAction(section, action.id);
              }
            },
          })),
          {text: 'Cancel', style: 'cancel'},
        ],
      );
    },
    [folderActions, handleFolderMenuAction],
  );

  const showProjectActions = React.useCallback(
    (project: Project) => {
      const actions = projectActions(project);
      Alert.alert(
        project.name,
        undefined,
        [
          ...actions.map(action => ({
            text: action.title,
            style: action.attributes?.destructive ? 'destructive' : 'default',
            onPress: () => {
              if (action.id === 'move_to_folder' && action.subactions?.length) {
                Alert.alert(
                  'Move to Folder',
                  undefined,
                  [
                    ...action.subactions.map(subaction => ({
                      text: subaction.title,
                      onPress: () => {
                        if (subaction.id) {
                          handleProjectMenuAction(project, subaction.id);
                        }
                      },
                    })),
                    {text: 'Cancel', style: 'cancel'},
                  ],
                );
                return;
              }
              if (action.id) {
                handleProjectMenuAction(project, action.id);
              }
            },
          })),
          {text: 'Cancel', style: 'cancel'},
        ],
      );
    },
    [handleProjectMenuAction, projectActions],
  );

  return (
    <ScreenContainer
      scroll
      floatingContent={
        <Pressable
          onPress={openCreateTab}
          style={[styles.floatingCta, {backgroundColor: theme.colors.brandPrimary}]}>
          <Icon name="add" size={30} color="#fff" />
        </Pressable>
      }>
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

      <Text style={[styles.hintText, {color: theme.colors.textSecondary}]}>
        Hold project or folder for iOS context menu.
      </Text>

      <View style={styles.accordionList}>
        {sections.map(section => {
          const expanded = expandedFolders[section.id] !== false;
          const headerContent = (
            <View style={styles.accordionHeaderInner}>
              <View style={styles.accordionTitleWrap}>
                <Icon
                  name={expanded ? 'chevron-down' : 'chevron-forward'}
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <Text style={[styles.accordionTitle, {color: theme.colors.textPrimary}]}>
                  {section.name}
                </Text>
              </View>
              <Text style={[styles.accordionCount, {color: theme.colors.textSecondary}]}>
                {section.projects.length}
              </Text>
            </View>
          );

          const accordionHeaderPressable = (
            <Pressable
              onPress={() => toggleAccordion(section.id)}
              onLongPress={
                section.kind === 'all' ? undefined : () => showFolderActions(section)
              }
              delayLongPress={280}
              style={styles.accordionHeader}>
              {headerContent}
            </Pressable>
          );

          return (
            <View
              key={section.id}
              style={[styles.accordionCard, {borderColor: theme.colors.separator}]}>
              {accordionHeaderPressable}

              {(expanded || section.projects.some(p => p.id === pendingDelete?.projectId)) ? (
                section.projects.length ? (
                  <View style={styles.grid}>
                    {section.projects.map(project => {
                      const isDeleting = pendingDelete?.projectId === project.id;
                      if (!expanded && !isDeleting) {
                        return null;
                      }
                      return (
                        <View key={`${section.id}-${project.id}`} style={styles.gridItem}>
                          <ProjectCard
                            project={project}
                            onPress={() => navigation.navigate('Preview', {projectId: project.id})}
                            onLongPress={() => showProjectActions(project)}
                            deleting={isDeleting}
                            onDeleteAnimationEnd={() => {
                              if (pendingDelete?.projectId !== project.id) {
                                return;
                              }
                              const deleteMode = pendingDelete.mode;
                              setPendingDelete(null);
                              if (deleteMode === 'permanent') {
                                removeProjectPermanently(project.id);
                                return;
                              }
                              moveProjectToTrash(project.id);
                            }}
                            onToggleFavorite={() =>
                              updateProject(project.id, {favorite: !project.favorite})
                            }
                          />
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.emptyFolder}>
                    <Text style={[styles.emptyFolderText, {color: theme.colors.textSecondary}]}>
                      {section.kind === 'trash'
                        ? 'Trash is empty.'
                        : 'No projects in this folder yet.'}
                    </Text>
                  </View>
                )
              ) : null}
            </View>
          );
        })}
      </View>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.s1,
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
  hintText: {
    ...tokens.typography.footnote,
    marginBottom: tokens.spacing.s2,
  },
  accordionList: {
    gap: tokens.spacing.s2,
    paddingBottom: 120,
  },
  accordionCard: {
    borderWidth: 1,
    borderRadius: tokens.radius.m,
  },
  accordionHeader: {
    minHeight: 48,
    paddingHorizontal: tokens.spacing.s2,
    justifyContent: 'center',
  },
  accordionHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionTitle: {
    ...tokens.typography.headline,
  },
  accordionCount: {
    ...tokens.typography.footnote,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing.s2,
    paddingBottom: tokens.spacing.s2,
    gap: tokens.spacing.s2,
  },
  gridItem: {
    width: '47%',
  },
  emptyFolder: {
    paddingHorizontal: tokens.spacing.s2,
    paddingBottom: tokens.spacing.s2,
  },
  emptyFolderText: {
    ...tokens.typography.subhead,
  },
  floatingCta: {
    position: 'absolute',
    bottom: tokens.spacing.s3,
    right: tokens.spacing.s3,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
