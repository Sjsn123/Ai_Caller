import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';

const { width, height } = Dimensions.get('window');

type StarData = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  translateY: Animated.Value;
  duration: number;
};

export default function FloatingStars() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const starsRef = useRef<StarData[]>([]);

  useEffect(() => {
    // Create stars data
    const stars: StarData[] = [];
    for (let i = 0; i < 15; i++) {
      stars.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 4, // 4-12px
        opacity: new Animated.Value(Math.random() * 0.3 + 0.1), // 0.1-0.4
        translateY: new Animated.Value(0),
        duration: Math.random() * 3000 + 2000, // 2-5 seconds
      });
    }
    starsRef.current = stars;

    // Animate stars
    const animateStars = () => {
      stars.forEach((star) => {
        // Floating animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(star.translateY, {
              toValue: -20,
              duration: star.duration,
              useNativeDriver: true,
            }),
            Animated.timing(star.translateY, {
              toValue: 20,
              duration: star.duration,
              useNativeDriver: true,
            }),
          ])
        ).start();

        // Opacity animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(star.opacity, {
              toValue: 0.6,
              duration: star.duration * 0.7,
              useNativeDriver: true,
            }),
            Animated.timing(star.opacity, {
              toValue: 0.1,
              duration: star.duration * 0.3,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    };

    animateStars();
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {starsRef.current.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              opacity: star.opacity,
              transform: [{ translateY: star.translateY }],
            },
          ]}
        >
          <Star 
            size={star.size} 
            color={theme === 'dark' ? colors.primary : colors.secondary}
            fill={theme === 'dark' ? colors.primary : colors.secondary}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  star: {
    position: 'absolute',
  },
});