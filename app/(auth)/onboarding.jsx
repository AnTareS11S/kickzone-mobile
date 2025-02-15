import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import FormField from '../../components/FormField';
import api from '../../lib/api';
import { fetchUserData, updateOnboarding } from '../../redux/userSlice';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { SelectList } from 'react-native-dropdown-select-list';
import Toast from 'react-native-toast-message';

// Define the validation schema using yup
const onboardingFormSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  bio: Yup.string().required('Bio is required'),
  wantedRole: Yup.string()
    .oneOf(['Player', 'Coach', 'Referee'], 'Please select a valid role')
    .required('Role is required'),
});

const ROLES = [
  { key: 'Player', value: 'Player' },
  { key: 'Coach', value: 'Coach' },
  { key: 'Referee', value: 'Referee' },
];

const Onboarding = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
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
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Your profile has been updated',
        });

        setTimeout(() => router.replace('/home'), 1500);
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to complete onboarding',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 items-center justify-center p-5 bg-gray-50'>
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

        <View className='mb-4'>
          <Text className='text-sm text-gray-700 mb-1'>Role</Text>
          <Controller
            control={control}
            name='wantedRole'
            render={({ field: { onChange, value } }) => (
              <View>
                <SelectList
                  setSelected={(val) => onChange(val)}
                  data={ROLES}
                  save='value'
                  placeholder='Select a role'
                  search={false}
                  boxStyles={{
                    borderColor: '#e2e8f0',
                    borderRadius: 6,
                    height: 48,
                    paddingLeft: 12,
                  }}
                  dropdownStyles={{
                    borderColor: '#e2e8f0',
                    borderRadius: 6,
                  }}
                  defaultOption={value ? { key: value, value } : null}
                />
                {errors.wantedRole && (
                  <Text className='text-red-500 text-xs mt-1'>
                    {errors.wantedRole.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

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
