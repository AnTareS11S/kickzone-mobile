import React from 'react';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from '../constants';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

export default function App() {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
        }}
        keyboardShouldPersistTaps='handled'
      >
        <View className='flex-1 items-center justify-center px-6 pt-4 pb-8'>
          {/* Logo Section */}
          <View className='mb-8 items-center'>
            <Image
              source={images.logo}
              className='w-[250px] h-[70px]'
              resizeMode='contain'
              style={{ maxWidth: width * 0.7 }}
            />
          </View>

          {/* Illustration Section */}
          <View className='mb-8 items-center'>
            <Image
              source={images.cards}
              className='w-[320px] h-[250px]'
              resizeMode='contain'
              style={{ maxWidth: width * 0.85 }}
            />
          </View>

          {/* Headline Section */}
          <View className='mb-6 items-center px-4'>
            <Text
              className='text-center text-4xl font-bold text-gray-900 mb-2'
              numberOfLines={2}
            >
              Your Ultimate Football {'\n'}Experience Begins Here
            </Text>
            <Text
              className='text-center text-lg text-gray-600 mb-6'
              numberOfLines={2}
            >
              Connect, Compete, and Celebrate the Beautiful Game
            </Text>
          </View>

          {/* Call to Action */}
          <View className='w-full px-4'>
            <CustomButton
              title='Get Started'
              handlePress={() => router.push('/sign-in')}
              containerStyles='w-full'
              variant='primary'
            />

            {/* Alternative Auth Options */}
            <View className='flex-row items-center justify-center mt-6'>
              <View className='flex-1 h-[1px] bg-gray-300 mr-4' />
              <Text className='text-gray-500'>or</Text>
              <View className='flex-1 h-[1px] bg-gray-300 ml-4' />
            </View>

            <View className='mt-6 flex-row justify-center space-x-4'>
              <Link href='/sign-in' className='text-blue-600 font-medium'>
                Sign In
              </Link>
              <Link href='/sign-up' className='text-green-600 font-medium'>
                Create Account
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>

      <StatusBar backgroundColor='#ffffff' style='dark' />
    </SafeAreaView>
  );
}
