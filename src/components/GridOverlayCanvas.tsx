import React from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';

type Props = {
  rows: number;
  columns: number;
  strong?: boolean;
};

export const GridOverlayCanvas = ({rows, columns, strong}: Props) => {
  const [size, setSize] = React.useState({width: 0, height: 0});
  const alpha = strong ? 0.56 : 0.3;

  const onLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setSize({width, height});
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {Array.from({length: rows - 1}).map((_, idx) => (
        <View
          key={`h-${idx}`}
          style={[
            styles.line,
            {
              top: ((idx + 1) * size.height) / rows,
              left: 0,
              right: 0,
              height: strong ? 1.3 : 1,
              backgroundColor: `rgba(255,255,255,${alpha})`,
            },
          ]}
        />
      ))}
      {Array.from({length: columns - 1}).map((_, idx) => (
        <View
          key={`v-${idx}`}
          style={[
            styles.line,
            {
              left: ((idx + 1) * size.width) / columns,
              top: 0,
              bottom: 0,
              width: strong ? 1.3 : 1,
              backgroundColor: `rgba(255,255,255,${alpha})`,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
  },
});
