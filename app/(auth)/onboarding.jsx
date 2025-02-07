import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import FormField from '../../components/FormField';
import api from '../../lib/api';
import { Picker } from '@react-native-picker/picker';
import { fetchUserData, updateOnboarding } from '../../redux/userSlice';

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
  const navigation = useNavigation();

  console.log(currentUser);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(onboardingFormSchema),
    defaultValues: {
      wantedRole: '',
      username: '',
      bio: '',
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

      if (res.ok) {
        dispatch(updateOnboarding(true));
        dispatch(fetchUserData(userId));
        Alert.alert('Success', 'Your profile has been successfully updated!');
        setTimeout(() => navigation.navigate('Home'), 1500);
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
          title='Username'
          value={control._defaultValues.username}
          placeholder='Enter your username'
          handleChangeText={(text) => control.setValue('username', text)}
        />

        <FormField
          title='Bio'
          value={control._defaultValues.bio}
          placeholder='Tell us about yourself'
          handleChangeText={(text) => control.setValue('bio', text)}
        />

        <Text className='text-gray-600 mb-2'>Role</Text>
        <Controller
          control={control}
          name='wantedRole'
          render={({ field: { value, onChange } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={{ height: 50, width: '100%' }}
            >
              <Picker.Item label='Select Role' value='' />
              <Picker.Item label='Player' value='Player' />
              <Picker.Item label='Coach' value='Coach' />
              <Picker.Item label='Referee' value='Referee' />
            </Picker>
          )}
        />

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className={`bg-purple-600 py-3 rounded-lg mt-4 ${
            loading ? 'opacity-50' : ''
          } flex items-center`}
        >
          {loading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text className='text-white font-bold'>Update Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding;
