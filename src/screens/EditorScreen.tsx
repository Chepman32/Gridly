import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  type ImageLoadEventData,
  type NativeSyntheticEvent,
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
import {DEFAULT_PRESET, DEFAULT_TRANSFORM, GRID_PRESETS} from '../types/models';
import {getFillTransform, snapToZero} from '../utils/imageMath';
import {resolveImageUri} from '../utils/imagePath';

type Props = NativeStackScreenProps<RootStackParamList, 'Editor'>;

const MAX_SCALE = 4;
const MIN_SCALE = 1;
const FALLBACK_IMAGE_SIZE = {width: 1, height: 1};
const DEFAULT_FILL_SCALE = getFillTransform().scale;

export const EditorScreen = ({route, navigation}: Props) => {
  const theme = useAppTheme();
  const project = useAppStore(state =>
    state.projects.find(item => item.id === route.params.projectId),
  );
  const customTemplates = useAppStore(state => state.customTemplates);
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
  const [imageSize, setImageSize] = React.useState(FALLBACK_IMAGE_SIZE);

  const translateX = useSharedValue(safeProject.transform.x);
  const translateY = useSharedValue(safeProject.transform.y);
  const scale = useSharedValue(safeProject.transform.scale);
  const rotation = useSharedValue(safeProject.transform.rotation);
  const panStartX = useSharedValue(safeProject.transform.x);
  const panStartY = useSharedValue(safeProject.transform.y);
  const pinchStartScale = useSharedValue(safeProject.transform.scale);
  const controlsOpacity = useSharedValue(1);
  const projectId = safeProject.id;
  const width = Dimensions.get('window').width - tokens.spacing.s2 * 2;
  const canvasHeight = (width * safeProject.preset.rows) / safeProject.preset.columns;
  const imageAspect = imageSize.width / imageSize.height;
  const canvasAspect = width / canvasHeight;
  const baseImageWidth = imageAspect > canvasAspect ? canvasHeight * imageAspect : width;
  const baseImageHeight = imageAspect > canvasAspect ? canvasHeight : width / imageAspect;

  const clampTranslation = React.useCallback(
    (x: number, y: number, currentScale: number) => {
      'worklet';
      const scaledWidth = baseImageWidth * currentScale;
      const scaledHeight = baseImageHeight * currentScale;
      const maxX = Math.max(0, (scaledWidth - width) / 2);
      const maxY = Math.max(0, (scaledHeight - canvasHeight) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [baseImageHeight, baseImageWidth, canvasHeight, width],
  );

  React.useEffect(() => {
    if (!project?.imageUri) {
      setImageSize(FALLBACK_IMAGE_SIZE);
      return;
    }
    let active = true;
    Image.getSize(
      resolveImageUri(project.imageUri),
      (imgWidth, imgHeight) => {
        if (active) {
          setImageSize({
            width: Math.max(1, imgWidth),
            height: Math.max(1, imgHeight),
          });
        }
      },
      () => {
        if (active) {
          setImageSize(FALLBACK_IMAGE_SIZE);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [project?.imageUri]);

  const handleImageLoad = React.useCallback(
    (event: NativeSyntheticEvent<ImageLoadEventData>) => {
      const nextWidth = Math.max(1, event.nativeEvent.source.width || 1);
      const nextHeight = Math.max(1, event.nativeEvent.source.height || 1);
      setImageSize(prev =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : {width: nextWidth, height: nextHeight},
      );
    },
    [],
  );

  React.useEffect(() => {
    if (!project) {
      return;
    }
    const safeScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, project.transform.scale));
    const clamped = clampTranslation(project.transform.x, project.transform.y, safeScale);
    translateX.value = clamped.x;
    translateY.value = clamped.y;
    scale.value = safeScale;
    rotation.value = project.transform.rotation;

    if (
      clamped.x === project.transform.x &&
      clamped.y === project.transform.y &&
      safeScale === project.transform.scale
    ) {
      return;
    }

    void updateProject(projectId, {
      transform: {
        ...project.transform,
        x: clamped.x,
        y: clamped.y,
        scale: safeScale,
      },
    });
  }, [
    project,
    projectId,
    clampTranslation,
    rotation,
    scale,
    translateX,
    translateY,
    updateProject,
  ]);

  React.useEffect(() => {
    if (!project) {
      return;
    }
    const needsFillMode = project.transform.fitMode !== 'fill';
    const needsFillScale = project.transform.scale < DEFAULT_FILL_SCALE;
    if (!needsFillMode && !needsFillScale) {
      return;
    }
    void updateProject(project.id, {
      transform: {
        ...project.transform,
        fitMode: 'fill',
        scale: Math.max(project.transform.scale, DEFAULT_FILL_SCALE),
      },
    });
  }, [project, updateProject]);

  const updateInteractionState = (active: boolean) => {
    setInteracting(active);
    controlsOpacity.value = withTiming(active ? 0.25 : 1, {
      duration: tokens.motion.timing.fast,
    });
  };

  const saveTransform = () => {
    const safeScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value));
    const clamped = clampTranslation(translateX.value, translateY.value, safeScale);
    translateX.value = clamped.x;
    translateY.value = clamped.y;
    scale.value = safeScale;
    updateProject(projectId, {
      transform: {
        ...safeProject.transform,
        x: clamped.x,
        y: clamped.y,
        scale: safeScale,
        rotation: rotation.value,
      },
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panStartX.value = translateX.value;
      panStartY.value = translateY.value;
      runOnJS(updateInteractionState)(true);
    })
    .onUpdate(event => {
      const nextX = panStartX.value + event.translationX;
      const nextY = panStartY.value + event.translationY;
      const clamped = clampTranslation(nextX, nextY, scale.value);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      const clamped = clampTranslation(translateX.value, translateY.value, scale.value);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
      runOnJS(updateInteractionState)(false);
      runOnJS(saveTransform)();
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.value = scale.value;
      runOnJS(updateInteractionState)(true);
    })
    .onUpdate(event => {
      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, pinchStartScale.value * event.scale),
      );
      scale.value = nextScale;
      const clamped = clampTranslation(translateX.value, translateY.value, nextScale);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      const clamped = clampTranslation(translateX.value, translateY.value, scale.value);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
      runOnJS(updateInteractionState)(false);
      runOnJS(saveTransform)();
    });

  const rotateGesture = Gesture.Rotation().onUpdate(event => {
    if (!safeProject.rotationEnabled) {
      return;
    }
    rotation.value = snapToZero((rotation.value + (event.rotation * 180) / Math.PI) % 360);
  });

  const gesture = Gesture.Simultaneous(panGesture, pinchGesture, rotateGesture);

  const panStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}, {translateY: translateY.value}],
  }));

  const zoomRotateStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}, {rotate: `${rotation.value}deg`}],
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

  return (
    <View style={[styles.root, {backgroundColor: theme.colors.background}]}> 
      <View style={styles.topBar}>
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
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}>
        <GestureDetector gesture={gesture}>
          <View style={[styles.canvas, {height: canvasHeight, borderRadius: tokens.radius.canvas}]}>
            <Animated.View
              style={[
                styles.imageFrame,
                {
                  width: baseImageWidth,
                  height: baseImageHeight,
                  left: (width - baseImageWidth) / 2,
                  top: (canvasHeight - baseImageHeight) / 2,
                },
                panStyle,
              ]}>
              <Animated.View style={[styles.imageInner, zoomRotateStyle]}>
                <Image
                  source={{uri: resolveImageUri(project.imageUri)}}
                  style={styles.canvasImage}
                  resizeMode="cover"
                  onLoad={handleImageLoad}
                />
              </Animated.View>
            </Animated.View>
            <GridOverlayCanvas
              rows={project.preset.rows}
              columns={project.preset.columns}
              strong={isInteracting}
            />
          </View>
        </GestureDetector>
      </ScrollView>

      <Animated.View style={[styles.controls, controlsStyle, {paddingBottom: tokens.spacing.s2}]}>
        <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>Preset</Text>
        <PresetPicker
          presets={GRID_PRESETS}
          selected={project.preset}
          onSelect={preset => updateProject(projectId, {preset})}
        />
        <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>Custom Templates</Text>
        {customTemplates.length ? (
          <PresetPicker
            presets={customTemplates}
            selected={project.preset}
            onSelect={preset => updateProject(projectId, {preset})}
          />
        ) : (
          <Text style={[styles.emptyCustomText, {color: theme.colors.textSecondary}]}>
            No custom templates yet.
          </Text>
        )}

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
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.s2,
    paddingVertical: tokens.spacing.s1,
  },
  projectName: {
    ...tokens.typography.headline,
    maxWidth: 140,
  },
  canvas: {
    marginHorizontal: tokens.spacing.s2,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  imageFrame: {
    position: 'absolute',
  },
  imageInner: {
    width: '100%',
    height: '100%',
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
  controls: {
    marginTop: tokens.spacing.s2,
    paddingHorizontal: tokens.spacing.s2,
    gap: tokens.spacing.s1,
  },
  sectionLabel: {
    ...tokens.typography.footnote,
  },
  emptyCustomText: {
    ...tokens.typography.subhead,
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
