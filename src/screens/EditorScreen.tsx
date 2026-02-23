import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {GridOverlayCanvas} from '../components/GridOverlayCanvas';
import {PresetPicker} from '../components/PresetPicker';
import {PrimaryButton} from '../components/PrimaryButton';
import {RootStackParamList} from '../navigation/types';
import {useAppStore} from '../state/useAppStore';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {DEFAULT_PRESET, DEFAULT_TRANSFORM} from '../types/models';
import {getFillTransform, getFitTransform, snapToZero} from '../utils/imageMath';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Editor'>;

const MAX_SCALE = 4;
const MIN_SCALE = 0.5;

export const EditorScreen = ({route, navigation}: Props) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const project = useAppStore(state =>
    state.projects.find(item => item.id === route.params.projectId),
  );
  const updateProject = useAppStore(state => state.updateProject);

  const safeProject =
    project ??
    ({
      id: 'missing',
      name: 'Missing project',
      imageUri: '',
      createdAt: '',
      updatedAt: '',
      favorite: false,
      preset: DEFAULT_PRESET,
      tileResolution: 1080,
      numberOverlay: true,
      rotationEnabled: false,
      transform: DEFAULT_TRANSFORM,
      exports: [],
    } as const);

  const [isInteracting, setInteracting] = React.useState(false);
  const [seamInspect, setSeamInspect] = React.useState(false);

  const historyRef = React.useRef([safeProject.transform]);
  const historyIndexRef = React.useRef(0);

  const translateX = useSharedValue(safeProject.transform.x);
  const translateY = useSharedValue(safeProject.transform.y);
  const scale = useSharedValue(safeProject.transform.scale);
  const rotation = useSharedValue(safeProject.transform.rotation);
  const panStartX = useSharedValue(safeProject.transform.x);
  const panStartY = useSharedValue(safeProject.transform.y);
  const controlsOpacity = useSharedValue(1);
  const projectId = safeProject.id;

  const updateInteractionState = (active: boolean) => {
    setInteracting(active);
    controlsOpacity.value = withTiming(active ? 0.25 : 1, {
      duration: tokens.motion.timing.fast,
    });
  };

  const pushHistory = (nextTransform: typeof safeProject.transform) => {
    const stack = historyRef.current.slice(0, historyIndexRef.current + 1);
    stack.push(nextTransform);
    historyRef.current = stack;
    historyIndexRef.current = stack.length - 1;
  };

  const saveTransform = async () => {
    await updateProject(projectId, {
      transform: {
        ...safeProject.transform,
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      },
    });
  };

  const applyTransform = (transform: typeof safeProject.transform) => {
    translateX.value = transform.x;
    translateY.value = transform.y;
    scale.value = transform.scale;
    rotation.value = transform.rotation;
  };

  const undo = () => {
    if (historyIndexRef.current === 0) {
      return;
    }
    historyIndexRef.current -= 1;
    const transform = historyRef.current[historyIndexRef.current];
    applyTransform(transform);
    void updateProject(projectId, {transform});
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      return;
    }
    historyIndexRef.current += 1;
    const transform = historyRef.current[historyIndexRef.current];
    applyTransform(transform);
    void updateProject(projectId, {transform});
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panStartX.value = translateX.value;
      panStartY.value = translateY.value;
      runOnJS(updateInteractionState)(true);
    })
    .onUpdate(event => {
      translateX.value = panStartX.value + event.translationX;
      translateY.value = panStartY.value + event.translationY;
    })
    .onEnd(() => {
      runOnJS(updateInteractionState)(false);
      runOnJS(pushHistory)({
        ...safeProject.transform,
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
      runOnJS(saveTransform)();
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => runOnJS(updateInteractionState)(true))
    .onUpdate(event => {
      const next = scale.value * event.scale;
      scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    })
    .onEnd(() => {
      runOnJS(updateInteractionState)(false);
      runOnJS(pushHistory)({
        ...safeProject.transform,
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
      runOnJS(saveTransform)();
    });

  const rotateGesture = Gesture.Rotation().onUpdate(event => {
    if (!safeProject.rotationEnabled) {
      return;
    }
    rotation.value = snapToZero((rotation.value + (event.rotation * 180) / Math.PI) % 360);
  });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const next = safeProject.transform.fitMode === 'fit' ? getFillTransform() : getFitTransform();
      runOnJS(updateProject)(projectId, {
        transform: next,
      });
      scale.value = next.scale;
      translateX.value = 0;
      translateY.value = 0;
      rotation.value = next.rotation;
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Race(doubleTap, panGesture),
    pinchGesture,
    rotateGesture,
  );

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
      {rotate: `${rotation.value}deg`},
    ],
  }));

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  if (!project) {
    return (
      <View style={[styles.notFound, {backgroundColor: theme.colors.background}]}> 
        <Text style={{color: theme.colors.textPrimary}}>Project not found.</Text>
      </View>
    );
  }

  const width = Dimensions.get('window').width - tokens.spacing.s2 * 2;
  const canvasHeight = (width * project.preset.rows) / project.preset.columns;

  return (
    <View style={[styles.root, {backgroundColor: theme.colors.background}]}> 
      <View style={[styles.topBar, {paddingTop: insets.top}]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Text style={[styles.topBtnText, {color: theme.colors.brandPrimary}]}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.prompt('Rename project', undefined, text => {
              if (text?.trim()) {
                void updateProject(projectId, {name: text.trim()});
              }
            })
          }>
          <Text style={[styles.projectName, {color: theme.colors.textPrimary}]} numberOfLines={1}>
            {project.name}
          </Text>
        </Pressable>
        <View style={styles.undoRow}>
          <Pressable onPress={undo} style={styles.topBtn}>
            <Text style={[styles.topBtnText, {color: theme.colors.textSecondary}]}>Undo</Text>
          </Pressable>
          <Pressable onPress={redo} style={styles.topBtn}>
            <Text style={[styles.topBtnText, {color: theme.colors.textSecondary}]}>Redo</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <GestureDetector gesture={gesture}>
          <View style={[styles.canvas, {height: canvasHeight, borderRadius: tokens.radius.canvas}]}>
            <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
              <Image source={{uri: project.imageUri}} style={StyleSheet.absoluteFill} resizeMode="cover" />
            </Animated.View>
            <GridOverlayCanvas
              rows={project.preset.rows}
              columns={project.preset.columns}
              strong={seamInspect || isInteracting}
            />
          </View>
        </GestureDetector>
      </ScrollView>

      <Animated.View style={[styles.controls, controlsStyle, {paddingBottom: insets.bottom + tokens.spacing.s2}]}>
        <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>Preset</Text>
        <PresetPicker
          selected={project.preset}
          onSelect={preset => updateProject(projectId, {preset})}
        />

        <View style={styles.quickControls}>
          <Pressable
            style={[styles.chip, {borderColor: theme.colors.separator}]}
            onPress={() =>
              updateProject(projectId, {
                transform:
                  safeProject.transform.fitMode === 'fit'
                    ? getFillTransform()
                    : getFitTransform(),
              })
            }>
            <Text style={[styles.chipLabel, {color: theme.colors.textPrimary}]}>Fit / Fill</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, {borderColor: theme.colors.separator}]}
            onPress={() =>
              updateProject(projectId, {
                rotationEnabled: !safeProject.rotationEnabled,
              })
            }>
            <Text style={[styles.chipLabel, {color: theme.colors.textPrimary}]}>Lock Rot</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, {borderColor: theme.colors.separator}]}
            onPress={() => setSeamInspect(current => !current)}>
            <Text style={[styles.chipLabel, {color: theme.colors.textPrimary}]}>Seam Inspect</Text>
          </Pressable>
        </View>

        <View style={styles.bottomRow}>
          <Pressable
            style={[styles.resolutionBtn, {borderColor: theme.colors.separator}]}
            onPress={() =>
              Alert.alert('Resolution', 'Choose tile resolution', [
                {
                  text: '1080 (Recommended)',
                  onPress: () => updateProject(projectId, {tileResolution: 1080}),
                },
                {text: '2048', onPress: () => updateProject(projectId, {tileResolution: 2048})},
                {text: 'Cancel', style: 'cancel'},
              ])
            }>
            <Text style={[styles.chipLabel, {color: theme.colors.textPrimary}]}>Resolution {project.tileResolution}</Text>
          </Pressable>
          <PrimaryButton
            label="Next"
            onPress={() => navigation.navigate('Preview', {projectId: projectId})}
            style={styles.nextBtn}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1},
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: tokens.spacing.s1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.s2,
    paddingVertical: tokens.spacing.s1,
  },
  topBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  topBtnText: {
    ...tokens.typography.callout,
    fontWeight: '600',
  },
  projectName: {
    ...tokens.typography.headline,
    maxWidth: 140,
  },
  undoRow: {
    flexDirection: 'row',
    gap: 6,
  },
  canvas: {
    marginHorizontal: tokens.spacing.s2,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  controls: {
    marginTop: tokens.spacing.s2,
    paddingHorizontal: tokens.spacing.s2,
    gap: tokens.spacing.s1,
  },
  sectionLabel: {
    ...tokens.typography.footnote,
  },
  quickControls: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 40,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    ...tokens.typography.caption2,
    fontWeight: '600',
  },
  bottomRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  resolutionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  nextBtn: {
    width: 120,
  },
});
