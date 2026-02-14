import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KanjiBrowser } from '../components/KanjiBrowser';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type BrowseNavProp = NativeStackNavigationProp<RootStackParamList, 'Browse'>;

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export function BrowseScreen() {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<BrowseNavProp>();

  const handleSelect = useCallback(
    (_kanji: KanjiVGData) => {
      // Navigate back to practice with this kanji selected
      // For now, just go back — future: pass kanji as param
      navigation.goBack();
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <KanjiBrowser onSelect={handleSelect} />
    </View>
  );
}
