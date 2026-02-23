import React from 'react';
import {Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '../components/ScreenContainer';
import {SegmentedControl} from '../components/SegmentedControl';
import {PrimaryButton} from '../components/PrimaryButton';
import {RootStackParamList} from '../navigation/types';
import {useAppStore} from '../state/useAppStore';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {buildPostingOrder, buildTilePositions} from '../utils/postingOrder';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;
type PreviewTab = 'Tiles' | 'Posting Order' | 'Simulation';

const CANVAS_WIDTH = Dimensions.get('window').width - tokens.spacing.s2 * 2;

export const PreviewScreen = ({route, navigation}: Props) => {
  const theme = useAppTheme();
  const project = useAppStore(state =>
    state.projects.find(item => item.id === route.params.projectId),
  );
  const [tab, setTab] = React.useState<PreviewTab>('Tiles');
  const [showNumbers, setShowNumbers] = React.useState(true);

  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = panX.value;
      startY.value = panY.value;
    })
    .onUpdate(event => {
      panX.value = startX.value + event.translationX;
      panY.value = startY.value + event.translationY;
    });

  const imageAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: panX.value},
      {translateY: panY.value},
    ],
  }));

  if (!project) {
    return (
      <ScreenContainer>
        <Text style={{color: theme.colors.textPrimary}}>Project not found.</Text>
      </ScreenContainer>
    );
  }

  const tilePositions = buildTilePositions(project.preset);
  const postingOrder = buildPostingOrder(project.preset);
  const canvasHeight = (CANVAS_WIDTH * project.preset.rows) / project.preset.columns;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Preview</Text>
        <PrimaryButton
          label="Export"
          onPress={() => navigation.navigate('Export', {projectId: project.id})}
          style={styles.exportBtn}
        />
      </View>

      <SegmentedControl
        options={['Tiles', 'Posting Order', 'Simulation']}
        selected={tab}
        onChange={value => setTab(value as PreviewTab)}
      />

      {tab === 'Tiles' ? (
        <GestureDetector gesture={panGesture}>
          <View style={[styles.tileCanvas, {height: canvasHeight}]}>
            <Animated.View style={[StyleSheet.absoluteFill, imageAnimStyle]}>
              <Image
                source={{uri: project.imageUri}}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </Animated.View>
            {tilePositions.map(tile => (
              <View
                key={tile.index}
                style={[
                  styles.tileCell,
                  {
                    left: `${((tile.column - 1) / project.preset.columns) * 100}%`,
                    top: `${((tile.row - 1) / project.preset.rows) * 100}%`,
                    width: `${(1 / project.preset.columns) * 100}%`,
                    height: `${(1 / project.preset.rows) * 100}%`,
                  },
                ]}>
                {showNumbers ? (
                  <Text style={styles.tileLabelOverlay}>{tile.index}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </GestureDetector>
      ) : null}

      {tab === 'Posting Order' ? (
        <ScrollView contentContainerStyle={styles.orderList}>
          <Text style={[styles.caption, {color: theme.colors.textSecondary}]}>Post from bottom-right to top-left to rebuild the final mosaic correctly.</Text>
          {postingOrder.map((tile, index) => (
            <View
              key={tile}
              style={[styles.orderRow, {borderColor: theme.colors.separator}]}>
              <Text style={[styles.orderText, {color: theme.colors.textPrimary}]}>Step {index + 1}: Post tile {tile}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {tab === 'Simulation' ? (
        <View style={[styles.simulation, {borderColor: theme.colors.separator}]}>
          <Text style={[styles.simTitle, {color: theme.colors.textPrimary}]}>Profile Simulation</Text>
          <Text style={[styles.caption, {color: theme.colors.textSecondary}]}>Neutral grid preview with final target composition orientation.</Text>
          <View style={[styles.simGrid, {borderColor: theme.colors.separator}]}>
            {Array.from({length: Math.min(9, tilePositions.length)}).map((_, idx) => (
              <View key={idx} style={[styles.simCell, {borderColor: theme.colors.separator}]}>
                <Text style={{color: theme.colors.textSecondary}}>{idx + 1}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={() => setShowNumbers(current => !current)}
        style={[styles.toggleRow, {borderColor: theme.colors.separator}]}>
        <Text style={[styles.toggleText, {color: theme.colors.textPrimary}]}>Number overlays</Text>
        <Text style={[styles.toggleText, {color: theme.colors.textSecondary}]}>{showNumbers ? 'On' : 'Off'}</Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.s2,
    gap: tokens.spacing.s2,
  },
  title: {
    ...tokens.typography.title2,
  },
  exportBtn: {
    width: 120,
  },
  tileCanvas: {
    marginTop: tokens.spacing.s2,
    width: CANVAS_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  tileCell: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabelOverlay: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  orderList: {
    paddingTop: tokens.spacing.s2,
    gap: tokens.spacing.s1,
    paddingBottom: tokens.spacing.s2,
  },
  caption: {
    ...tokens.typography.footnote,
  },
  orderRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  orderText: {
    ...tokens.typography.subhead,
  },
  simulation: {
    marginTop: tokens.spacing.s2,
    borderWidth: 1,
    borderRadius: tokens.radius.l,
    padding: tokens.spacing.s2,
    gap: tokens.spacing.s1,
  },
  simTitle: {
    ...tokens.typography.headline,
  },
  simGrid: {
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  simCell: {
    width: '33.333%',
    aspectRatio: 1,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    marginTop: tokens.spacing.s2,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: tokens.spacing.s2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    ...tokens.typography.subhead,
  },
});
