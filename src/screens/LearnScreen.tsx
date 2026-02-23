import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {ScreenContainer} from '../components/ScreenContainer';
import {learnArticles} from '../services/learnContent';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';

export const LearnScreen = () => {
  const theme = useAppTheme();
  const [query, setQuery] = React.useState('');
  const [showTextOnly, setShowTextOnly] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!query.trim()) {
      return learnArticles;
    }
    const normalized = query.toLowerCase();
    return learnArticles.filter(
      article =>
        article.title.toLowerCase().includes(normalized) ||
        article.content.toLowerCase().includes(normalized) ||
        article.keywords.some(keyword => keyword.includes(normalized)),
    );
  }, [query]);

  return (
    <ScreenContainer scroll>
      <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Learn</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search posting order"
        placeholderTextColor={theme.colors.textTertiary}
        style={[
          styles.search,
          {borderColor: theme.colors.separator, color: theme.colors.textPrimary},
        ]}
      />

      <Pressable
        onPress={() => setShowTextOnly(current => !current)}
        style={[styles.toggle, {borderColor: theme.colors.separator}]}> 
        <Text style={[styles.toggleText, {color: theme.colors.textPrimary}]}>Text-only explanation</Text>
      </Pressable>

      <View style={styles.list}>
        {filtered.map(article => (
          <View
            key={article.id}
            style={[styles.card, {borderColor: theme.colors.separator, backgroundColor: theme.colors.surface}]}> 
            <Text style={[styles.cardTitle, {color: theme.colors.textPrimary}]}>{article.title}</Text>
            <Text style={[styles.cardContent, {color: theme.colors.textSecondary}]}>
              {article.content}
            </Text>
          </View>
        ))}
      </View>

      {!showTextOnly ? (
        <View style={[styles.demo, {borderColor: theme.colors.separator}]}> 
          <Text style={[styles.demoTitle, {color: theme.colors.textPrimary}]}>Interactive demo</Text>
          <Text style={[styles.demoText, {color: theme.colors.textSecondary}]}>Drag mentally from bottom-right to top-left. New posts always appear at top-left.</Text>
        </View>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...tokens.typography.title1,
    marginBottom: tokens.spacing.s2,
  },
  search: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    paddingHorizontal: tokens.spacing.s2,
    ...tokens.typography.body,
  },
  toggle: {
    marginTop: tokens.spacing.s2,
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleText: {
    ...tokens.typography.footnote,
    fontWeight: '600',
  },
  list: {
    marginTop: tokens.spacing.s2,
    gap: tokens.spacing.s1,
  },
  card: {
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.s2,
    gap: 4,
  },
  cardTitle: {
    ...tokens.typography.headline,
  },
  cardContent: {
    ...tokens.typography.subhead,
  },
  demo: {
    marginTop: tokens.spacing.s3,
    borderWidth: 1,
    borderRadius: tokens.radius.l,
    padding: tokens.spacing.s2,
    gap: 8,
  },
  demoTitle: {
    ...tokens.typography.headline,
  },
  demoText: {
    ...tokens.typography.subhead,
  },
});
