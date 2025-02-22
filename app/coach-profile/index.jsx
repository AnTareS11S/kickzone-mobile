import { Controller, useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { ProfileSchema } from '../../lib/validation';
import useFetch from '../../hooks/useFetch';
import { useSelector } from 'react-redux';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import FormField from '../../components/FormField';
import { SelectList } from 'react-native-dropdown-select-list';
import CustomButton from '../../components/CustomButton';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import api from '../../lib/api';

const CoachProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState();
  const { data: countriesData } = useFetch('/api/admin/country');
  const { data: coach, isLoading: loading } = useFetch(
    `/api/coach/get/${currentUser?._id}`
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formattedCountries, setFormattedCountries] = useState([]);

  // Format countries data for SelectList
  useEffect(() => {
    if (countriesData) {
      const formatted = countriesData.map((country) => ({
        key: country.id,
        value: country.name,
      }));
      setFormattedCountries(formatted);
    }
  }, [countriesData]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues: {
      name: '',
      surname: '',
      nationality: '',
      city: '',
      bio: '',
      birthDate: '',
      photo: null,
    },
  });

  useEffect(() => {
    if (coach) {
      reset({
        name: coach?.name || '',
        surname: coach?.surname || '',
        nationality: '',
        city: coach?.city || '',
        bio: coach?.bio || '',
        birthDate: coach?.birthDate ? new Date(coach.birthDate) : '',
        photo: coach?.imageUrl || null,
      });
    }
  }, [coach, reset]);

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

  const countryName = countriesData?.find((c) => c.id === coach?.nationality);

  useEffect(() => {
    if (coach?.nationality) {
      const countryName = countriesData?.find((c) =>
        c.id?.includes(coach?.nationality)
      );

      console.log(coach?.nationality);
      console.log(countryName?.name);
      if (countryName) {
        setValue('nationality', coach.nationality);
      }
    }
  }, [coach, countriesData]);

  const onSubmit = async (formData) => {
    setIsSaving(true);
    const formattedDate = new Date(formData.birthDate);
    const data = new FormData();

    if (file) {
      const fileToUpload = {
        uri: file.uri,
        type: 'image/jpeg',
        name: file.fileName || 'photo.jpg',
      };

      data.append('photo', fileToUpload);
    }

    data.append('name', formData.name);
    data.append('surname', formData.surname);
    data.append('nationality', formData.nationality);
    data.append('city', formData.city);
    data.append('bio', formData.bio);
    data.append('birthDate', formattedDate.toISOString());

    try {
      const res = await api.post(`/api/coach/create`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Coach profile updated successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Failed to update coach profile',
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
                  coach?.imageUrl ||
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
            name='name'
            title='Name'
            placeholder='Enter your name'
          />

          <FormField
            control={control}
            name='surname'
            title='Surname'
            placeholder='Enter your surname'
          />

          <FormField
            control={control}
            name='bio'
            title='Bio'
            placeholder='Enter your bio'
          />

          <View className='mb-4'>
            <Text className='text-sm text-gray-700 mb-1'>Nationality</Text>
            <Controller
              control={control}
              name='nationality'
              render={({ field: { onChange, value } }) => (
                <View>
                  <SelectList
                    setSelected={(val) => onChange(val)}
                    data={formattedCountries}
                    save='key'
                    placeholder='Select Nationality'
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
                    defaultOption={value ? { key: value, value: value } : null}
                  />
                  {errors.nationality && (
                    <Text className='text-red-500 text-xs mt-1'>
                      {errors.nationality.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          <FormField
            control={control}
            name='city'
            title='City'
            placeholder='Enter your city'
          />

          <FormField
            control={control}
            name='birthDate'
            title='Birth Date'
            placeholder='Select date'
            isDate={true}
            rules={{ required: 'Birth date is required' }}
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

export default CoachProfile;
