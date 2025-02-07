import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as Yup from 'yup';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import OAuth from '../../components/OAuth';
import CustomButton from '../../components/CustomButton';
import api from '../../lib/api';

const SignUpSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
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
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = async () => {
    try {
      await SignUpSchema.validate(form, { abortEarly: false });
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

  const submit = async () => {
    const isValid = await validateForm();

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      // Check username availability
      const usernameCheck = await api.get(`/api/auth/check-username`, {
        params: { username: form.username },
      });

      if (usernameCheck.data.exists) {
        setErrors((prev) => ({
          ...prev,
          username: 'Username already exists',
        }));
        setIsSubmitting(false);
        return;
      }

      // Check email availability
      const emailCheck = await api.get(`/api/auth/check-email`, {
        params: { email: form.email },
      });

      if (emailCheck.data.exists) {
        setErrors((prev) => ({
          ...prev,
          email: 'Email already exists',
        }));
        setIsSubmitting(false);
        return;
      }

      // Signup request
      const response = await api.post('/api/auth/signup', form);

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
              title='Username'
              value={form.username}
              handleChangeText={(text) => {
                setForm({ ...form, username: text });
                setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              error={errors.username}
              otherStyles='mt-4'
            />

            <FormField
              title='Email Address'
              value={form.email}
              handleChangeText={(text) => {
                setForm({ ...form, email: text });
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              keyboardType='email-address'
              otherStyles='mt-4'
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
              otherStyles='mt-4'
              isPassword
            />

            <FormField
              title='Confirm Password'
              value={form.confirmPassword}
              handleChangeText={(text) => {
                setForm({ ...form, confirmPassword: text });
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
              otherStyles='mt-4'
              isPassword
            />

            <CustomButton
              title='Create Account'
              handlePress={submit}
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
