import React, {PropsWithChildren} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useAppTheme} from '../theme/useAppTheme';
import {tokens} from '../theme/tokens';

type Props = PropsWithChildren<{
  scroll?: boolean;
  floatingContent?: React.ReactNode;
}>;

export const ScreenContainer = ({children, scroll, floatingContent}: Props) => {
  const theme = useAppTheme();
  const content = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: theme.colors.background}]}>
      {scroll ? <ScrollView>{content}</ScrollView> : content}
      {floatingContent}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1},
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.s2,
    paddingVertical: tokens.spacing.s2,
  },
});
