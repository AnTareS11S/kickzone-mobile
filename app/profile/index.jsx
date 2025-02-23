import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SelectList } from 'react-native-dropdown-select-list';
import Toast from 'react-native-toast-message';
import api from '../../lib/api';
import FormField from '../../components/FormField';
import useFetch from '../../hooks/useFetch';
import { useSelector } from 'react-redux';
import CustomButton from '../../components/CustomButton';

const profileFormSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  bio: Yup.string(),
  wantedRole: Yup.string().required('Role is required'),
});

const ROLES = [
  { key: 'Player', value: 'Player' },
  { key: 'Coach', value: 'Coach' },
  { key: 'Referee', value: 'Referee' },
];

const ProfileForm = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const { data: user, isLoading: loading } = useFetch(
    `/api/user/get/${currentUser?._id}`
  );
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(profileFormSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      wantedRole: '',
      photo: null,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || '',
        wantedRole: user?.role || '',
        photo: user?.imageUrl || null,
      });
    }
  }, [user, reset]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
      setValue('photo', result.assets[0], { shouldValidate: true });
    }
  };

  const onSubmit = async (formData) => {
    setIsSaving(true);
    const data = new FormData();
    if (file) {
      const fileToUpload = {
        uri: file.uri,
        type: 'image/jpeg',
        name: file.fileName || 'photo.jpg',
      };

      data.append('photo', fileToUpload);
    }

    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('bio', formData.bio);
    data.append('wantedRole', formData.wantedRole);

    try {
      const res = await api.post(`/api/user/add/${user?._id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'User profile updated successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Failed to update user profile',
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Something went wrong',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center bg-gray-50'>
        <ActivityIndicator size='large' color='#4F46E5' />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 bg-gray-50'>
      <View className='p-6 max-w-2xl mx-auto w-full'>
        <View className='bg-white rounded-2xl p-6 shadow-lg'>
          {/* Profile Picture Section */}
          <View className='items-center mb-8'>
            <View className='relative'>
              <Image
                source={{
                  uri:
                    file?.uri ||
                    user?.imageUrl ||
                    'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
                }}
                className='w-32 h-32 rounded-full border-4 border-white shadow-lg'
              />
              <TouchableOpacity
                className='absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 shadow-md'
                onPress={pickImage}
              >
                <Icon name='camera' size={20} color='#fff' />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View className='space-y-6'>
            <FormField
              control={control}
              name='username'
              title='Username'
              placeholder='Enter your username'
              containerStyles='mb-0'
            />

            <FormField
              control={control}
              name='email'
              title='Email Address'
              placeholder='example@email.com'
              keyboardType='email-address'
              containerStyles='mb-0'
            />

            {/* Role Selection */}
            <View>
              <Text className='text-sm font-medium text-gray-700 mb-2'>
                Select Role
              </Text>
              <Controller
                control={control}
                name='wantedRole'
                render={({ field: { onChange, value } }) => (
                  <View>
                    <SelectList
                      setSelected={(val) => onChange(val)}
                      data={ROLES}
                      save='value'
                      placeholder='Select your role'
                      searchPlaceholder='Search...'
                      search={false}
                      boxStyles={{
                        borderColor: errors.wantedRole ? '#EF4444' : '#E5E7EB',
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 16,
                        backgroundColor: '#F9FAFB',
                      }}
                      inputStyles={{ color: '#1F2937' }}
                      dropdownStyles={{
                        borderColor: '#E5E7EB',
                        borderRadius: 8,
                        marginTop: 4,
                      }}
                      defaultOption={value ? { key: value, value } : null}
                    />
                    {errors.wantedRole && (
                      <Text className='text-red-500 text-sm mt-1.5'>
                        {errors.wantedRole.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            <FormField
              control={control}
              name='bio'
              title='Bio'
              placeholder='Tell us about yourself...'
              multiline
              numberOfLines={4}
              inputStyles='min-h-32 text-left'
            />

            {/* Save Button */}
            <CustomButton
              title='Save Changes'
              handlePress={handleSubmit(onSubmit)}
              containerStyles='w-full mt-4'
              textStyles='font-medium'
              sendingIndicator='Saving...'
              isLoading={isSaving}
              disabled={isSaving}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileForm;
