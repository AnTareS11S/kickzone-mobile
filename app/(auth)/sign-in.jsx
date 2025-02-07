import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
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

// Validation Schema
const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const SignIn = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banInfo, setBanInfo] = useState(null);

  // Validation Function
  const validateForm = async () => {
    try {
      await SignInSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const errorMessages = {};
      err.inner.forEach((error) => {
        errorMessages[error.path] = error.message;
      });
      setErrors(errorMessages);
      return false;
    }
  };

  const extractTokenFromCookie = (cookie) => {
    if (!cookie || cookie.length === 0) return null;

    const tokenMatch = cookie[0].match(/access_token=([^;]+)/);
    return tokenMatch ? tokenMatch[1] : null;
  };

  const submit = async () => {
    // Validate form
    const isValid = await validateForm();
    if (!isValid) return;

    // Check if email exists
    const emailCheck = await api.get(`/api/auth/check-email`, {
      params: { email: form.email },
    });

    if (!emailCheck.data.exists) {
      setErrors((prev) => ({
        ...prev,
        email: 'Email does not exist',
      }));
      setIsSubmitting(false);
      return;
    }

    dispatch(signInStart());

    setIsSubmitting(true);
    try {
      // Attempt login
      const response = await api.post('/api/auth/signin', form);

      // Bezpieczniejsze sprawdzanie danych
      const data = response.data;

      const token = extractTokenFromCookie(response.headers['set-cookie']);

      if (!token) {
        Alert.alert('Login Error', 'Could not retrieve authentication token');
        return;
      }

      // Handle ban scenarios
      if (response.status === 405 && data.banInfo) {
        setBanInfo(data.banInfo);
        setIsSubmitting(false);
        return;
      }

      // Handle invalid password
      if (response.status === 403) {
        setErrors((prev) => ({
          ...prev,
          password: 'Invalid password',
        }));
        setIsSubmitting(false);
        return;
      }

      // Handle login failure
      if (response.status === 200) {
        dispatch(signInSuccess(data));
        Alert.alert('Success', 'Logged in successfully');
      } else {
        console.error('Login failed:', response.statusText);
        Alert.alert('Login Failed', response.statusText || 'Unable to log in');
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
      console.error('Login error details:', error);
      dispatch(signInFailure(error.response.data.message));

      if (error.response) {
        // Serwer zwrócił błąd poza zakresem 2xx
        console.error('Server error response:', error.response.data);
        Alert.alert(
          'Login Error',
          error.response.data.message || 'Server error'
        );
      } else if (error.request) {
        // Żądanie zostało wysłane, ale nie otrzymano odpowiedzi
        console.error('No response received');
        Alert.alert('Network Error', 'No response from server');
      } else {
        // Coś poszło nie tak podczas przygotowania żądania
        console.error('Error setting up request', error.message);
        Alert.alert('Error', 'Unable to process login');
      }

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
                title='Email Address'
                value={form.email}
                handleChangeText={(e) => {
                  setForm({ ...form, email: e });
                  // Clear email error when user starts typing
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                error={errors.email}
                otherStyles='mb-4'
                keyboardType='email-address'
                autoCapitalize='none'
              />

              <FormField
                title='Password'
                value={form.password}
                handleChangeText={(e) => {
                  setForm({ ...form, password: e });
                  // Clear password error when user starts typing
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                error={errors.password}
                otherStyles='mb-6'
                isPassword
              />

              {/* Sign In Button */}
              <CustomButton
                title='Sign In'
                handlePress={submit}
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
