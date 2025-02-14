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
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='p-4'>
        <View className='bg-white rounded-xl p-4 shadow'>
          <View className='items-center mb-6 relative'>
            <Image
              source={{
                uri:
                  file?.uri ||
                  user?.imageUrl ||
                  'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
              }}
              className='w-24 h-24 rounded-full'
            />
            <TouchableOpacity
              className='absolute bottom-0 right-[35%] bg-blue-600 rounded-full w-10 h-10 justify-center items-center'
              onPress={pickImage}
            >
              <Icon name='camera' size={20} color='#fff' />
            </TouchableOpacity>
          </View>

          <FormField
            control={control}
            name='username'
            title='Username'
            placeholder='Enter your username'
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

          <FormField
            control={control}
            name='email'
            title='Email'
            placeholder='Enter your email'
          />

          <FormField
            control={control}
            name='bio'
            title='Bio'
            placeholder='Enter your bio'
          />

          <CustomButton
            title='Save'
            handlePress={handleSubmit(onSubmit)}
            containerStyles='w-full'
            sendingIndicator='Saving...'
            isLoading={isSaving}
            disabled={isSaving}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileForm;
