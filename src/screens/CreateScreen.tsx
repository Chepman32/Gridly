import React from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {ScreenContainer} from '../components/ScreenContainer';
import {PresetPicker} from '../components/PresetPicker';
import {useAppStore} from '../state/useAppStore';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {DEFAULT_PRESET} from '../types/models';
import {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const makeSampleUri = () =>
  `${RNFS.DocumentDirectoryPath}/gridly/samples/sample.png`;

const SAMPLE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5xW2kAAAAASUVORK5CYII=';

export const CreateScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const addProject = useAppStore(state => state.addProject);
  const selectedPreset = useAppStore(state => state.selectedPreset) ?? DEFAULT_PRESET;
  const setSelectedPreset = useAppStore(state => state.setSelectedPreset);

  const openEditorForUri = React.useCallback(
    async (uri: string) => {
      try {
        const project = await addProject({imageUri: uri, preset: selectedPreset});
        navigation.navigate('Editor', {projectId: project.id});
      } catch {
        Alert.alert('Import failed', 'Could not create a project from this file.');
      }
    },
    [addProject, navigation, selectedPreset],
  );

  const importFromPhotos = React.useCallback(async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      includeExtra: false,
    });
    if (result.didCancel) {
      return;
    }
    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      Alert.alert('Limited Access', 'Please allow photo library access or use Files import.');
      return;
    }
    await openEditorForUri(uri);
  }, [openEditorForUri]);

  const importFromFiles = React.useCallback(async () => {
    try {
      const file = await DocumentPicker.pickSingle({type: [DocumentPicker.types.images]});
      if (file.uri) {
        await openEditorForUri(file.uri);
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Import failed', 'The selected file format is not supported.');
      }
    }
  }, [openEditorForUri]);

  const importSample = React.useCallback(async () => {
    try {
      const dir = `${RNFS.DocumentDirectoryPath}/gridly/samples`;
      const file = makeSampleUri();
      const exists = await RNFS.exists(file);
      if (!exists) {
        await RNFS.mkdir(dir);
        await RNFS.writeFile(file, SAMPLE_BASE64, 'base64');
      }
      await openEditorForUri(`file://${file}`);
    } catch {
      Alert.alert('Sample unavailable', 'Could not prepare local sample image.');
    }
  }, [openEditorForUri]);

  return (
    <ScreenContainer scroll>
      <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Create</Text>

      <Pressable onPress={importFromPhotos} style={[styles.card, {borderColor: theme.colors.separator}]}> 
        <Icon name="images-outline" size={22} color={theme.colors.brandPrimary} />
        <Text style={[styles.cardTitle, {color: theme.colors.textPrimary}]}>Import from Photos</Text>
        <Icon name="chevron-forward" size={18} color={theme.colors.textSecondary} />
      </Pressable>

      <Pressable onPress={importFromFiles} style={[styles.card, {borderColor: theme.colors.separator}]}> 
        <Icon name="document-outline" size={22} color={theme.colors.brandPrimary} />
        <Text style={[styles.cardTitle, {color: theme.colors.textPrimary}]}>Import from Files</Text>
        <Icon name="chevron-forward" size={18} color={theme.colors.textSecondary} />
      </Pressable>

      <View style={styles.sectionGap}>
        <Text style={[styles.sectionTitle, {color: theme.colors.textSecondary}]}>Presets</Text>
        <PresetPicker selected={selectedPreset} onSelect={setSelectedPreset} />
      </View>

      <Pressable
        onPress={importSample}
        style={[styles.sampleBtn, {borderColor: theme.colors.separator}]}> 
        <Text style={[styles.sampleText, {color: theme.colors.textPrimary}]}>Try Sample</Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...tokens.typography.title1,
    marginBottom: tokens.spacing.s2,
  },
  card: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    paddingHorizontal: tokens.spacing.s2,
    marginBottom: tokens.spacing.s1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.s1,
  },
  cardTitle: {
    ...tokens.typography.headline,
    flex: 1,
  },
  sectionGap: {
    marginTop: tokens.spacing.s2,
    gap: tokens.spacing.s1,
  },
  sectionTitle: {
    ...tokens.typography.footnote,
  },
  sampleBtn: {
    marginTop: tokens.spacing.s3,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleText: {
    ...tokens.typography.callout,
    fontWeight: '600',
  },
});
