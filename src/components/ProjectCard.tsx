import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Project} from '../types/models';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {formatDate} from '../utils/date';

type Props = {
  project: Project;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export const ProjectCard = ({project, onPress, onToggleFavorite}: Props) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Project, ${project.preset.label} grid, last exported ${
        project.exports[0] ? formatDate(project.exports[0].createdAt) : 'never'
      }, tile size ${project.tileResolution}`}
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.separator,
          transform: [{scale: pressed ? 0.99 : 1}],
        },
      ]}>
      <View style={styles.thumbWrap}>
        <Image source={{uri: project.imageUri}} style={styles.thumb} resizeMode="cover" />
        <Pressable onPress={onToggleFavorite} style={styles.starBtn}>
          <Icon
            name={project.favorite ? 'star' : 'star-outline'}
            size={18}
            color={project.favorite ? theme.colors.warning : theme.colors.textPrimary}
          />
        </Pressable>
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
  starBtn: {
    position: 'absolute',
    top: tokens.spacing.s1,
    right: tokens.spacing.s1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
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
});
