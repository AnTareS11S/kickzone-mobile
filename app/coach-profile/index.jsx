import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
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
    resolver: yupResolver(ProfileSchema(coach ? true : false)),
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
        nationality: coach?.nationality
          ? countriesData.find((c) => c._id === coach?.nationality)?.name || ''
          : '',
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

  const onSubmit = async (formData) => {
    setIsSaving(true);
    const formattedDate = new Date(formData.birthDate);
    const data = new FormData();

    const countryId = countriesData.find(
      (c) => c.name === formData.nationality
    )?._id;

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
    data.append('user', currentUser._id);
    data.append('nationality', countryId || formData.nationality);
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
                    coach?.imageUrl ||
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
            <View className='flex-row space-x-4'>
              <View className='flex-1'>
                <FormField
                  control={control}
                  name='name'
                  title='First Name'
                  placeholder='John'
                  containerStyles='mb-0'
                />
              </View>
              <View className='flex-1'>
                <FormField
                  control={control}
                  name='surname'
                  title='Last Name'
                  placeholder='Doe'
                  containerStyles='mb-0'
                />
              </View>
            </View>

            <FormField
              control={control}
              name='bio'
              title='Bio'
              placeholder='Tell us about yourself...'
              multiline
              numberOfLines={4}
              inputStyles='h-32 text-left'
            />

            {/* Nationality Select */}
            <View>
              <Text className='text-sm font-medium text-gray-700 mb-2'>
                Nationality
              </Text>
              <Controller
                control={control}
                name='nationality'
                render={({ field: { onChange, value } }) => (
                  <View>
                    <SelectList
                      setSelected={(val) => onChange(val)}
                      data={formattedCountries}
                      save='value'
                      placeholder='Select Nationality'
                      searchPlaceholder='Search...'
                      search={false}
                      boxStyles={{
                        borderColor: errors.nationality ? '#EF4444' : '#E5E7EB',
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
                    {errors.nationality && (
                      <Text className='text-red-500 text-sm mt-1.5'>
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
              placeholder='New York'
            />

            <FormField
              control={control}
              name='birthDate'
              title='Date of Birth'
              placeholder='Select date'
              isDate={true}
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

export default CoachProfile;
