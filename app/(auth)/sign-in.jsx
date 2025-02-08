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
import { Link, useRouter } from 'expo-router';
import * as Yup from 'yup';
import * as SecureStore from 'expo-secure-store';

import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import OAuth from '../../components/OAuth';
import { formatRemainingTime } from '../../lib/utils';
import api from '../../lib/api';
import { useDispatch } from 'react-redux';
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from '../../redux/userSlice';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Toast from 'react-native-toast-message';

// Validation Schema
const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .test('email-exists', 'Email does not exist', async (value) => {
      try {
        const response = await api.get(`/api/auth/check-email`, {
          params: { email: value },
        });
        return response.data.exists;
      } catch (error) {
        return false;
      }
    }),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const SignIn = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { control, handleSubmit, setError } = useForm({
    resolver: yupResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banInfo, setBanInfo] = useState(null);

  const extractTokenFromCookie = (cookie) => {
    if (!cookie || cookie.length === 0) return null;

    const tokenMatch = cookie[0].match(/access_token=([^;]+)/);
    return tokenMatch ? tokenMatch[1] : null;
  };

  const onSubmit = async (formData) => {
    dispatch(signInStart());
    setIsSubmitting(true);
    try {
      // Attempt login
      const response = await api.post('/api/auth/signin', formData);

      // Handle response
      const data = response.data;

      const token = extractTokenFromCookie(response.headers['set-cookie']);

      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid token',
          visibilityTime: 4000,
        });
        return;
      }

      // Handle login success and failure
      if (response.status === 200) {
        dispatch(signInSuccess(data));
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Logged in successfully',
          visibilityTime: 4000,
        });
      } else {
        console.error('Login failed:', response.statusText);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.statusText,
          visibilityTime: 4000,
        });
        dispatch(signInFailure(response.statusText));
        setIsSubmitting(false);
        return;
      }

      // Successful login
      // Store authentication token securely
      await SecureStore.setItemAsync('userToken', token);

      // Navigate based on onboarding status
      if (!data.isOnboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/home');
      }
    } catch (error) {
      // Handle ban scenarios
      if (error.response.status === 405 && error.response.data.banInfo) {
        setBanInfo(error.response.data.banInfo);
        setIsSubmitting(false);
        return;
      }

      // Handle invalid password
      if (error.response.status === 403) {
        setError('password', {
          type: 'manual',
          message: 'Invalid password',
        });
        setIsSubmitting(false);
        return;
      }
      console.error('Login error:', error.response);
      dispatch(
        signInFailure(error?.response?.data?.message || 'Unknown error')
      );
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Unknown error',
        visibilityTime: 4000,
      });
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
            {/* Ban Information Alert */}
            {banInfo && (
              <View className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
                <Text className='font-bold mb-2'>Account Suspended</Text>
                <Text>
                  Ban expires in: {formatRemainingTime(banInfo.endDate)}
                </Text>
                <Text>Reason: {banInfo.reason}</Text>
                {banInfo.endDate && (
                  <Text>
                    Until: {new Date(banInfo.endDate).toLocaleString()}
                  </Text>
                )}
                {banInfo.bannedBy && (
                  <Text>Banned by: {banInfo.bannedBy.username}</Text>
                )}
              </View>
            )}

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

            {/* OAuth Section */}
            <OAuth />

            {/* Separator */}
            <View className='flex-row items-center my-4'>
              <View className='flex-1 h-[1px] bg-gray-300' />
              <Text className='mx-4 text-gray-500'>or</Text>
              <View className='flex-1 h-[1px] bg-gray-300' />
            </View>

            {/* Form Section */}
            <View className='w-full'>
              <FormField
                control={control}
                name='email'
                title='Email'
                placeholder='Enter your email'
                keyboardType='email-address'
              />

              <FormField
                control={control}
                name='password'
                title='Password'
                placeholder='Enter your password'
                isPassword
              />

              {/* Sign In Button */}
              <CustomButton
                title='Sign In'
                handlePress={handleSubmit(onSubmit)}
                containerStyles='w-full'
                isLoading={isSubmitting}
                disabled={!!banInfo}
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
