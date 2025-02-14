import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
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

const ContactInfo = ({ icon: Icon, label, value }) => (
  <View className='flex-row items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-3'>
    {Icon}
    <View>
      <Text className='text-sm font-medium text-gray-500'>{label}</Text>
      <Text className='text-base font-semibold text-gray-900'>{value}</Text>
    </View>
  </View>
);

const ContactPage = () => {
  const { data: contactInfo, isLoading: loading } = useFetch(
    '/api/admin/contactOne'
  );

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center bg-white'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView
        className='flex-1 px-4 py-6'
        showsVerticalScrollIndicator={false}
      >
        <View className='space-y-6'>
          <FadeInView delay={200}>
            <View className='bg-white rounded-lg p-5 shadow-md'>
              <Text className='text-2xl font-bold text-gray-900 mb-4'>
                Contact Information
              </Text>
              <ContactInfo
                icon={<Icon name='user' size={20} color='#6B7280' />}
                label='Contact Person'
                value={`${contactInfo.name} ${contactInfo.lastName}`}
              />
              <ContactInfo
                icon={<Icon name='envelope' size={20} color='#6B7280' />}
                label='Email Address'
                value={contactInfo.email}
              />
              <ContactInfo
                icon={<Icon name='phone' size={20} color='#6B7280' />}
                label='Phone Number'
                value={contactInfo.phone}
              />
              <ContactInfo
                icon={<Icon name='map-marker' size={20} color='#6B7280' />}
                label='Office Location'
                value={contactInfo.address}
              />
            </View>
          </FadeInView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactPage;
