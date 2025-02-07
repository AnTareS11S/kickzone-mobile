import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as Yup from 'yup';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import OAuth from '../../components/OAuth';
import CustomButton from '../../components/CustomButton';
import api from '../../lib/api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const SignUpSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .required('Username is required')
    .test('username-exists', 'Username does exist already', async (value) => {
      try {
        const response = await api.get(`/api/auth/check-username`, {
          params: { username: value },
        });
        return response.data.exists;
      } catch (error) {
        return false;
      }
    }),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .test('email-exists', 'Email does exist already', async (value) => {
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
    .matches(
      /[A-Za-z0-9!@#$%^&*()]/,
      'Password must contain letters, numbers, and symbols'
    )
    .required('Password is required'),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords must match'
  ),
});

const SignUp = () => {
  const router = useRouter();
  const { control, handleSubmit, setError } = useForm({
    resolver: yupResolver(SignUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Signup request
      const response = await api.post('/api/auth/signup', formData);

      if (response.status === 201) {
        // Navigate to sign-in or home screen
        router.replace('/sign-in');
      } else {
        // Handle signup error
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Show error toast or alert
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='w-full min-h-full px-4 my-6'>
          <Image
            source={images.logo}
            className='w-[175px] h-[45px] self-center'
            resizeMode='contain'
          />

          <Text className='text-2xl font-bold text-black mt-6 text-center'>
            Create Your Account
          </Text>

          {/* OAuth Component (Optional) */}
          <OAuth />

          <View className='mt-4'>
            <FormField
              control={control}
              name='username'
              title='Username'
              placeholder='Enter your username'
            />

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

            <FormField
              control={control}
              name='confirmPassword'
              title='Confirm Password'
              placeholder='Re-enter your password'
              isPassword
            />

            <CustomButton
              title='Create Account'
              handlePress={handleSubmit(onSubmit)}
              containerStyles='w-full'
              isLoading={isSubmitting}
            />

            <View className='flex-row justify-center mt-4'>
              <Text className='text-base text-gray-600 mr-2'>
                Already have an account?{' '}
              </Text>
              <Link href='/sign-in' className='text-blue-500'>
                Sign In
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
