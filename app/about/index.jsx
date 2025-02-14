import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useFetch from '../../hooks/useFetch';

const FadeInView = ({ delay = 0, style, children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY, delay]);

  return (
    <Animated.View
      style={[{ opacity: fadeAnim, transform: [{ translateY }] }, style]}
    >
      {children}
    </Animated.View>
  );
};

const FadeInHorizontalView = ({
  delay = 0,
  direction = 'left',
  style,
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(
    new Animated.Value(direction === 'left' ? -30 : 30)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateX, delay, direction]);

  return (
    <Animated.View
      style={[{ opacity: fadeAnim, transform: [{ translateX }] }, style]}
    >
      {children}
    </Animated.View>
  );
};

const SectionHeader = ({ children }) => (
  <View className='flex-row items-center mb-3'>
    <View className='w-1 h-6 bg-purple-600 rounded-full mr-3' />
    <Text className='text-2xl font-bold text-gray-900 tracking-tight'>
      {children}
    </Text>
  </View>
);

const AboutPage = () => {
  const { data: about, isLoading: loading } = useFetch('/api/admin/aboutOne');

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center bg-white'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {about && (
          <View>
            {/* Hero Section */}
            <View className='relative h-60'>
              <Image
                source={{ uri: about.imageUrl }}
                className='absolute inset-0 w-full h-full'
                resizeMode='cover'
              />
              <View
                className='absolute inset-0 bg-black/50'
                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              />
            </View>

            {/* Content Section */}
            <View className='px-4 -mt-5'>
              <View className='bg-white rounded-xl p-5 shadow-md'>
                <FadeInView delay={200}>
                  <Text className='text-base text-gray-600 text-center italic leading-relaxed tracking-tight justify-center flex-1'>
                    "{about.description}"
                  </Text>
                </FadeInView>
              </View>

              {/* Mission Section */}
              <View className='mt-8'>
                <FadeInHorizontalView delay={400} direction='left'>
                  <SectionHeader>Our Mission</SectionHeader>
                  <Text className='text-base text-gray-700 leading-relaxed tracking-tight'>
                    {about.mission}
                  </Text>
                </FadeInHorizontalView>
              </View>

              {/* Why Us Section */}
              <View className='mt-8 mb-10'>
                <FadeInHorizontalView delay={600} direction='right'>
                  <SectionHeader>Why KickZone?</SectionHeader>
                  <Text className='text-base text-gray-700 leading-relaxed tracking-tight'>
                    {about.whyUs}
                  </Text>
                </FadeInHorizontalView>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutPage;
