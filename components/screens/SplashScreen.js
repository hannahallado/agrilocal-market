import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Platform
} from 'react-native';

const SplashScreen = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get the correct image source for web and mobile
  const getLogoSource = () => {
    if (Platform.OS === 'web') {
      // For web, use require or import the image
      try {
        // Try to get the image from the public folder or assets
        return require('../../assets/splashscreen.png');
      } catch (e) {
        // Fallback for web - you can also use a URL
        return { uri: '/assets/splashscreen.png' };
      }
    } else {
      // For mobile
      return require('../../assets/splashscreen.png');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.logoContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Image 
          source={getLogoSource()}
          style={styles.logo}
          resizeMode="contain"
          onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
        />
        <Text style={styles.title}>AgriLocal</Text>
        <Text style={styles.subtitle}>Market</Text>
        <Text style={styles.tagline}>Fresh from local farms to your table</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 230,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  subtitle: {
    fontSize: 24,
    color: '#FFF',
    marginTop: -8,
    opacity: 0.9,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  tagline: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 20,
    opacity: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default SplashScreen;