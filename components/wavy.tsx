import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';

export default function MusicWaveAnimation() {
  const shared = useSharedValue(30);
  // Create animated values for each bar
  const bars = Array(8)
    .fill(0)
    .map((_, i) => {
      return shared;
    });

  // Set up animations
  useEffect(() => {
    bars.forEach((bar, index) => {
      const randomHeight = Math.floor(Math.random() * 40) + 20;
      const delay = index * 100;

      bar.value = withDelay(
        delay,
        withRepeat(
          withTiming(randomHeight, {
            duration: 1000 + Math.random() * 500,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          -1,
          true
        )
      );
    });
  }, []);

  const barStyles = bars.map((bar) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      height: bar.value,
    }))
  );

  return (
    <View style={styles.container}>
      {barStyles.map((style, index) => (
        <Animated.View
          key={index}
          style={[styles.bar, style, { backgroundColor: getBarColor(index) }]}
        />
      ))}
    </View>
  );
}

const getBarColor = (index: number) => {
  const colors = ['#6C63FF', '#FF6584', '#4BD4FF', '#FFB17A'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 80,
    width: '100%',
  },
  bar: {
    width: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
});
