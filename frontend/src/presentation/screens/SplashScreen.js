import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '../components/BrandMark';
import { colors, spacing } from '../../theme/theme';

export function SplashScreen() {
  const [entrance] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      stiffness: 120,
      damping: 16,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const scale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.brand, { opacity: entrance, transform: [{ scale }] }]}>
        <BrandMark size={84} />
        <Text style={styles.title}>Calendario</Text>
        <Text style={styles.subtitle}>Tu agenda, siempre contigo</Text>
      </Animated.View>
      <ActivityIndicator color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: spacing.lg,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  loader: {
    marginTop: spacing.xxl,
  },
});
