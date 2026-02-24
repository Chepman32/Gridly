import React from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Project} from '../types/models';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {formatDate} from '../utils/date';
import {resolveImageUri} from '../utils/imagePath';

type Props = {
  project: Project;
  onPress: () => void;
  onLongPress?: () => void;
  deleting?: boolean;
  onDeleteAnimationEnd?: () => void;
};

const PARTICLE_COUNT = 34;

export const ProjectCard = ({
  project,
  onPress,
  onLongPress,
  deleting,
  onDeleteAnimationEnd,
}: Props) => {
  const theme = useAppTheme();
  const scale = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;
  const particles = React.useRef(
    Array.from({length: PARTICLE_COUNT}, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      size: 2 + Math.round(Math.random() * 3),
      startX: (Math.random() - 0.5) * 120,
      startY: (Math.random() - 0.5) * 170,
      targetX: (Math.random() - 0.5) * 140,
      targetY: -30 - Math.random() * 170,
    })),
  ).current;
  const [showParticles, setShowParticles] = React.useState(false);
  const didRunDeleteAnimation = React.useRef(false);

  React.useEffect(() => {
    if (!deleting || didRunDeleteAnimation.current) {
      return;
    }
    didRunDeleteAnimation.current = true;
    setShowParticles(true);

    const particleAnimations = particles.map((p, i) =>
      Animated.sequence([
        Animated.delay((i / PARTICLE_COUNT) * 60),
        Animated.timing(p.opacity, {
          toValue: 1,
          duration: 70,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(p.x, {
            toValue: p.targetX,
            duration: 420,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: p.targetY,
            duration: 420,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 380,
            delay: 40,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      ...particleAnimations,
    ]).start(() => {
      onDeleteAnimationEnd?.();
      setShowParticles(false);
      scale.setValue(1);
      opacity.setValue(1);
      for (const particle of particles) {
        particle.x.setValue(0);
        particle.y.setValue(0);
        particle.opacity.setValue(0);
      }
      didRunDeleteAnimation.current = false;
    });
  }, [deleting, onDeleteAnimationEnd, opacity, particles, scale]);

  return (
    <View>
      <Animated.View style={{transform: [{scale}], opacity}}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Project, ${project.preset.label} grid, last exported ${
            project.exports[0] ? formatDate(project.exports[0].createdAt) : 'never'
          }, tile size ${project.tileResolution}`}
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={280}
          style={({pressed}) => [
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.separator,
              transform: [{scale: pressed ? 0.99 : 1}],
            },
          ]}>
          <View style={styles.thumbWrap}>
            <Image source={{uri: resolveImageUri(project.imageUri)}} style={styles.thumb} resizeMode="cover" />
          </View>
          <View style={styles.meta}>
            <Text style={[styles.title, {color: theme.colors.textPrimary}]} numberOfLines={1}>
              {project.name}
            </Text>
            <View style={[styles.badge, {borderColor: theme.colors.separator}]}>
              <Text style={[styles.badgeLabel, {color: theme.colors.textSecondary}]}>
                {project.preset.label}
              </Text>
            </View>
            <Text style={[styles.sub, {color: theme.colors.textSecondary}]} numberOfLines={2}>
              {project.exports[0]
                ? `Exported ${formatDate(project.exports[0].createdAt)} · ${project.tileResolution}px`
                : `No exports yet · ${project.tileResolution}px`}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
      {showParticles ? (
        <View pointerEvents="none" style={styles.particleLayer}>
          {particles.map((particle, index) => (
            <Animated.View
              key={`${project.id}-dust-${index}`}
              style={[
                styles.particle,
                {
                  width: particle.size,
                  height: particle.size,
                  borderRadius: particle.size / 2,
                  backgroundColor: theme.colors.textSecondary,
                  opacity: particle.opacity,
                  transform: [
                    {translateX: particle.startX ?? 0},
                    {translateY: particle.startY ?? 0},
                    {translateX: particle.x},
                    {translateY: particle.y},
                  ],
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius.m,
    borderWidth: 1,
    overflow: 'hidden',
    flex: 1,
  },
  thumbWrap: {
    aspectRatio: 1,
    width: '100%',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  meta: {
    padding: tokens.spacing.s1,
    gap: 4,
  },
  title: {
    ...tokens.typography.headline,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeLabel: {
    ...tokens.typography.caption2,
    fontWeight: '600',
  },
  sub: {
    ...tokens.typography.caption2,
  },
  particleLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
});
