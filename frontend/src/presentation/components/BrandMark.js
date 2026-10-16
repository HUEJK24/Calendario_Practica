import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/theme';

export function BrandMark({ size = 72, style }) {
  const dot = size * 0.072;
  const barHeight = size * 0.1;

  return (
    <View
      style={[
        styles.tile,
        {
          borderRadius: size * 0.3,
          height: size,
          padding: size * 0.19,
          width: size,
        },
        style,
      ]}
    >
      <View style={[styles.sheet, { borderRadius: size * 0.16, paddingVertical: size * 0.13 }]}>
        <View style={[styles.bar, { height: barHeight, marginBottom: size * 0.1 }]} />
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: colors.primary, height: dot, width: dot }]} />
          <View
            style={[
              styles.dot,
              { backgroundColor: colors.muted, height: dot, opacity: 0.45, width: dot },
            ]}
          />
          <View
            style={[
              styles.dot,
              { backgroundColor: colors.muted, height: dot, opacity: 0.45, width: dot },
            ]}
          />
        </View>
        <View style={styles.row}>
          <View
            style={[
              styles.dot,
              { backgroundColor: colors.muted, height: dot, opacity: 0.45, width: dot },
            ]}
          />
          <View
            style={[
              styles.dot,
              { backgroundColor: colors.muted, height: dot, opacity: 0.45, width: dot },
            ]}
          />
          <View style={[styles.dot, { backgroundColor: colors.primary, height: dot, width: dot }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  sheet: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
  },
  bar: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    width: '62%',
  },
  row: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
  },
  dot: {
    borderRadius: 999,
  },
});
