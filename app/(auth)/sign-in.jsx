import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    // Basic validation
    if (!form.email || !form.password) {
      // Show error message or toast
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate login process
      console.log('Logging in with:', form);
      // Actual login logic would go here
    } catch (error) {
      // Handle login error
      console.error('Login failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
        >
          <View className='flex-1 px-6 py-8 justify-center'>
            {/* Logo Section */}
            <View className='items-center mb-8'>
              <Image
                source={images.logo}
                className='w-[200px] h-[60px]'
                resizeMode='contain'
              />
              <Text className='text-3xl font-bold text-gray-800 mt-4'>
                Welcome Back
              </Text>
              <Text className='text-base text-gray-500 text-center mt-2'>
                Sign in to continue to KickZone
              </Text>
            </View>

            {/* Form Section */}
            <View className='w-full'>
              <FormField
                title='Email Address'
                value={form.email}
                handleChangeText={(e) => setForm({ ...form, email: e })}
                otherStyles='mb-4'
                keyboardType='email-address'
                autoCapitalize='none'
              />

              <FormField
                title='Password'
                value={form.password}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                otherStyles='mb-6'
                isPassword
              />

              {/* Sign In Button */}
              <CustomButton
                title='Sign In'
                handlePress={submit}
                containerStyles='w-full'
                isLoading={isSubmitting}
              />

              {/* Sign Up Link */}
              <View className='flex-row justify-center items-center mt-4'>
                <Text className='text-base text-gray-600 mr-2'>
                  Don't have an account?
                </Text>
                <Link href='/sign-up' className='text-blue-500'>
                  Sign Up
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
