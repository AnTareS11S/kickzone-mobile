import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import FormField from '../../components/FormField';
import api from '../../lib/api';
import { fetchUserData, updateOnboarding } from '../../redux/userSlice';
import CustomButton from '../../components/CustomButton';
import PickerField from '../../components/PickerField';
import { useRouter } from 'expo-router';

// Define the validation schema using yup
const onboardingFormSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  bio: Yup.string().required('Bio is required'),
  wantedRole: Yup.string()
    .oneOf(['Player', 'Coach', 'Referee'], 'Please select a valid role')
    .required('Role is required'),
});

const Onboarding = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(onboardingFormSchema),
    defaultValues: {
      username: '',
      bio: '',
      wantedRole: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        username: currentUser?.username || '',
        bio: currentUser?.bio || '',
        wantedRole: currentUser?.wantedRole || '',
      });
    }
  }, [currentUser]);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const userId = currentUser?._id;
      const res = await api.post('/api/auth/complete-onboarding', {
        userId,
        ...formData,
      });

      if (res.status === 200) {
        dispatch(updateOnboarding(true));
        dispatch(fetchUserData(userId));
        Alert.alert('Success', 'Your profile has been successfully updated!');
        setTimeout(() => router.replace('/home'), 1500);
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to complete onboarding. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 items-center justify-center p-5 bg-gray-100'>
      <View className='w-full bg-white p-6 rounded-xl shadow-lg'>
        <Text className='text-2xl font-bold text-center mb-4'>
          Update Your Profile
        </Text>
        <Text className='text-center text-gray-600 mb-6'>
          Fill in the details below to update your profile and choose your role.
        </Text>

        <FormField
          control={control}
          name='username'
          title='Username'
          placeholder='Enter your username'
        />

        <FormField
          control={control}
          name='bio'
          title='Bio'
          placeholder='Tell us about yourself'
        />

        <PickerField
          control={control}
          name='wantedRole'
          title='Role'
          options={[
            { label: 'Player', value: 'Player' },
            { label: 'Coach', value: 'Coach' },
            { label: 'Referee', value: 'Referee' },
          ]}
          defaultValue={currentUser?.wantedRole || ''}
        />

        <CustomButton
          title='Update Profile'
          handlePress={handleSubmit(onSubmit)}
          containerStyles='w-full mt-10'
          isLoading={loading}
          disabled={loading}
          sendingIndicator='Updating...'
        />
      </View>
    </View>
  );
};

export default Onboarding;
