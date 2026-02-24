import React from 'react';
import {LayoutChangeEvent, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ScreenContainer} from '../components/ScreenContainer';
import {PrimaryButton} from '../components/PrimaryButton';
import {useAppStore} from '../state/useAppStore';
import {tokens} from '../theme/tokens';
import {useAppTheme} from '../theme/useAppTheme';
import {DEFAULT_PRESET, GRID_PRESETS} from '../types/models';

const MIN_COLUMNS = 3;
const MAX_COLUMNS = 10;
const MIN_ROWS = 1;
const MAX_ROWS = 10;

type NumberStepperProps = {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
};

type TemplateSchematicPreviewProps = {
  columns: number;
  rows: number;
};

const TemplateSchematicPreview = ({columns, rows}: TemplateSchematicPreviewProps) => {
  const theme = useAppTheme();
  const [frame, setFrame] = React.useState({width: 0, height: 0});

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setFrame({width, height});
  }, []);

  const cellSize = React.useMemo(() => {
    if (!frame.width || !frame.height) {
      return 0;
    }
    return Math.floor(Math.min(frame.width / columns, frame.height / rows));
  }, [columns, frame.height, frame.width, rows]);

  const gridWidth = cellSize * columns;
  const gridHeight = cellSize * rows;
  const totalCells = columns * rows;

  return (
    <View
      onLayout={onLayout}
      style={[styles.previewFrame, {borderColor: theme.colors.separator}]}>
      <View
        style={[
          styles.grid,
          {
            width: gridWidth || undefined,
            height: gridHeight || undefined,
            borderColor: theme.colors.separator,
          },
        ]}>
        {Array.from({length: totalCells}).map((_, index) => (
          <View
            key={`${columns}-${rows}-${index}`}
            style={[
              styles.gridCell,
              {
                width: cellSize,
                height: cellSize,
                borderColor: theme.colors.separator,
                backgroundColor: `${theme.colors.brandPrimary}0D`,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const NumberStepper = ({
  label,
  value,
  onDecrease,
  onIncrease,
  canDecrease,
  canIncrease,
}: NumberStepperProps) => {
  const theme = useAppTheme();
  return (
    <View style={styles.stepperBlock}>
      <Text style={[styles.stepperLabel, {color: theme.colors.textSecondary}]}>{label}</Text>
      <View style={[styles.stepperRow, {borderColor: theme.colors.separator}]}>
        <Pressable
          onPress={onDecrease}
          disabled={!canDecrease}
          style={({pressed}) => [
            styles.stepperBtn,
            {
              opacity: canDecrease ? 1 : 0.45,
              backgroundColor: pressed ? theme.colors.separator : 'transparent',
            },
          ]}>
          <Icon name="remove" size={18} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={[styles.stepperValue, {color: theme.colors.textPrimary}]}>{value}</Text>
        <Pressable
          onPress={onIncrease}
          disabled={!canIncrease}
          style={({pressed}) => [
            styles.stepperBtn,
            {
              opacity: canIncrease ? 1 : 0.45,
              backgroundColor: pressed ? theme.colors.separator : 'transparent',
            },
          ]}>
          <Icon name="add" size={18} color={theme.colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
};

export const CustomTemplatesScreen = () => {
  const theme = useAppTheme();
  const customTemplates = useAppStore(state => state.customTemplates);
  const selectedPreset = useAppStore(state => state.selectedPreset) ?? DEFAULT_PRESET;
  const setSelectedPreset = useAppStore(state => state.setSelectedPreset);
  const addCustomTemplate = useAppStore(state => state.addCustomTemplate);
  const removeCustomTemplate = useAppStore(state => state.removeCustomTemplate);
  const [columns, setColumns] = React.useState(3);
  const [rows, setRows] = React.useState(1);

  const alreadyExists = React.useMemo(() => {
    const existsInDefault = GRID_PRESETS.some(
      preset => preset.columns === columns && preset.rows === rows,
    );
    const existsInCustom = customTemplates.some(
      template => template.columns === columns && template.rows === rows,
    );
    return existsInDefault || existsInCustom;
  }, [columns, customTemplates, rows]);

  const saveTemplate = React.useCallback(() => {
    const created = addCustomTemplate(columns, rows);
    if (created) {
      setSelectedPreset(created);
    }
  }, [addCustomTemplate, columns, rows, setSelectedPreset]);

  return (
    <ScreenContainer scroll>
      <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Custom Templates</Text>
      <Text style={[styles.caption, {color: theme.colors.textSecondary}]}>
        Build your own template and use it in Create.
      </Text>

      <View style={[styles.card, {borderColor: theme.colors.separator}]}>
        <Text style={[styles.cardTitle, {color: theme.colors.textPrimary}]}>New template</Text>
        <Text style={[styles.cardText, {color: theme.colors.textSecondary}]}>
          Set columns and rows. Range: {MIN_COLUMNS}-{MAX_COLUMNS} columns, {MIN_ROWS}-
          {MAX_ROWS} rows.
        </Text>

        <View style={styles.stepperGroup}>
          <NumberStepper
            label="Columns"
            value={columns}
            onDecrease={() => setColumns(prev => Math.max(MIN_COLUMNS, prev - 1))}
            onIncrease={() => setColumns(prev => Math.min(MAX_COLUMNS, prev + 1))}
            canDecrease={columns > MIN_COLUMNS}
            canIncrease={columns < MAX_COLUMNS}
          />
          <NumberStepper
            label="Rows"
            value={rows}
            onDecrease={() => setRows(prev => Math.max(MIN_ROWS, prev - 1))}
            onIncrease={() => setRows(prev => Math.min(MAX_ROWS, prev + 1))}
            canDecrease={rows > MIN_ROWS}
            canIncrease={rows < MAX_ROWS}
          />
        </View>

        <Text style={[styles.preview, {color: theme.colors.textPrimary}]}>Preview: {columns}×{rows}</Text>
        <TemplateSchematicPreview columns={columns} rows={rows} />

        <PrimaryButton
          label={alreadyExists ? 'Already exists' : 'Save template'}
          onPress={saveTemplate}
          disabled={alreadyExists}
        />
      </View>

      <View style={styles.listSection}>
        <Text style={[styles.listTitle, {color: theme.colors.textSecondary}]}>Saved templates</Text>
        {customTemplates.length ? (
          customTemplates.map(template => {
            const selected = selectedPreset.id === template.id;
            return (
              <View
                key={template.id}
                style={[
                  styles.templateRow,
                  {borderColor: selected ? theme.colors.brandPrimary : theme.colors.separator},
                ]}>
                <Pressable onPress={() => setSelectedPreset(template)} style={styles.templateMain}>
                  <Text style={[styles.templateLabel, {color: theme.colors.textPrimary}]}>
                    {template.label}
                  </Text>
                  <Text style={[styles.templateSub, {color: theme.colors.textSecondary}]}>
                    {template.columns} columns · {template.rows} rows
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${template.label}`}
                  onPress={() => removeCustomTemplate(template.id)}
                  style={({pressed}) => [
                    styles.removeBtn,
                    {backgroundColor: pressed ? theme.colors.separator : 'transparent'},
                  ]}>
                  <Icon name="trash-outline" size={18} color={theme.colors.textPrimary} />
                </Pressable>
              </View>
            );
          })
        ) : (
          <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
            No custom templates yet.
          </Text>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...tokens.typography.title1,
  },
  caption: {
    ...tokens.typography.footnote,
    marginTop: 6,
  },
  card: {
    marginTop: tokens.spacing.s2,
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.s2,
  },
  cardTitle: {
    ...tokens.typography.headline,
  },
  cardText: {
    ...tokens.typography.subhead,
    marginTop: 4,
  },
  stepperGroup: {
    marginTop: tokens.spacing.s2,
    gap: tokens.spacing.s1,
  },
  stepperBlock: {
    gap: 6,
  },
  stepperLabel: {
    ...tokens.typography.footnote,
  },
  stepperRow: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...tokens.typography.headline,
    fontWeight: '700',
  },
  preview: {
    ...tokens.typography.callout,
    marginTop: tokens.spacing.s2,
    marginBottom: tokens.spacing.s1,
    fontWeight: '600',
  },
  previewFrame: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.s1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.s2,
  },
  grid: {
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  gridCell: {
    borderWidth: 0.5,
  },
  listSection: {
    marginTop: tokens.spacing.s2,
    gap: tokens.spacing.s1,
  },
  listTitle: {
    ...tokens.typography.footnote,
  },
  templateRow: {
    borderWidth: 1,
    borderRadius: tokens.radius.m,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  templateMain: {
    flex: 1,
    paddingHorizontal: tokens.spacing.s2,
    paddingVertical: 12,
  },
  templateLabel: {
    ...tokens.typography.headline,
  },
  templateSub: {
    ...tokens.typography.footnote,
    marginTop: 2,
  },
  removeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  emptyText: {
    ...tokens.typography.subhead,
  },
});
