import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import api from '../lib/api';
import FormField from './FormField';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomButton from './CustomButton';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';

const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /[A-Za-z0-9!@#$%^&*()]/,
      'Password must contain letters, numbers, and symbols'
    )
    .required('Password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /[A-Za-z0-9!@#$%^&*()]/,
      'Password must contain letters, numbers, and symbols'
    )
    .required('Password is required'),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref('newPassword'), null],
    'Passwords must match'
  ),
});

const ChangePassword = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, setError, reset } = useForm({
    resolver: yupResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(
        `/api/user/change-password/${currentUser._id}`,
        formData
      );
      const response = await res.data;

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password updated successfully',
        });
        reset(
          {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          },
          { keepErrors: false }
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong',
        });
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setError('currentPassword', {
          type: 'manual',
          message: 'Invalid current password',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className='bg-white rounded-lg p-6 shadow-sm'>
      <Text className='text-xl font-bold mb-6 text-center text-gray-900'>
        Change Password
      </Text>

      <View className='space-y-4'>
        {/* Current Password Field */}
        <View>
          <FormField
            control={control}
            name='currentPassword'
            title='Current Password'
            placeholder='Enter current password'
            isPassword
          />
        </View>

        {/* New Password Field */}
        <View>
          <FormField
            control={control}
            name='newPassword'
            title='New Password'
            placeholder='Enter your new password'
            isPassword
          />
        </View>

        {/* Confirm Password Field */}
        <View>
          <FormField
            control={control}
            name='confirmPassword'
            title='Confirm Password'
            placeholder='Re-enter your new password'
            isPassword
          />
        </View>

        {/* Submit Button */}
        <CustomButton
          title='Change Password'
          handlePress={handleSubmit(onSubmit)}
          containerStyles='w-full'
          isLoading={isSubmitting}
        />
      </View>
    </View>
  );
};

export default ChangePassword;
