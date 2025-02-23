import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { PlayerSchema } from '../../lib/validation';
import useFetch from '../../hooks/useFetch';
import { useSelector } from 'react-redux';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FormField from '../../components/FormField';
import { SelectList } from 'react-native-dropdown-select-list';
import CustomButton from '../../components/CustomButton';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import api from '../../lib/api';

const PlayerProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState();
  const { data: positions } = useFetch('/api/admin/position');
  const { data: countries } = useFetch('/api/admin/country');
  const { data: teams } = useFetch('/api/admin/team');
  const { data: player, isLoading: loading } = useFetch(
    `/api/player/get/${currentUser?._id}`
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formattedCountries, setFormattedCountries] = useState([]);
  const [formattedPositions, setFormattedPositions] = useState([]);
  const [formattedTeams, setFormattedTeams] = useState([]);
  const [formattedFooted, setFormattedFooted] = useState([
    { key: 'Left', value: 'Left' },
    { key: 'Right', value: 'Right' },
  ]);

  useEffect(() => {
    if (countries) {
      setFormattedCountries(
        countries.map((c) => ({ key: c._id, value: c.name }))
      );
    }
    if (positions) {
      setFormattedPositions(
        positions.map((p) => ({ key: p._id, value: p.name }))
      );
    }
    if (teams) {
      setFormattedTeams(teams.map((t) => ({ key: t._id, value: t.name })));
    }
  }, [countries, positions, teams]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(PlayerSchema(player ? true : false)),
    defaultValues: {
      name: '',
      surname: '',
      nationality: '',
      wantedTeam: '',
      height: '',
      weight: '',
      position: '',
      number: '',
      footed: '',
      age: '',
      bio: '',
      photo: null,
    },
  });

  useEffect(() => {
    if (player) {
      reset({
        name: player?.name || '',
        surname: player?.surname || '',
        nationality: player?.nationality || '',
        city: player?.city || '',
        bio: player?.bio || '',
        height: player?.height?.toString() || '',
        weight: player?.weight?.toString() || '',
        position: player?.position || '',
        number: player?.number?.toString() || '',
        footed: player?.footed || '',
        wantedTeam: player?.wantedTeam || '',
        age: player?.age?.toString() || '',
        photo: player?.imageUrl || null,
      });
    }
  }, [player, reset]);

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

  const showInfoAlert = (message) => {
    Alert.alert('Information', message);
  };

  const onSubmit = async (formData) => {
    setIsSaving(true);
    const data = new FormData();

    formData.height = Number(formData.height);
    formData.weight = Number(formData.weight);
    formData.age = Number(formData.age);
    formData.number = Number(formData.number);

    const countryId = countries.find(
      (c) => c.name === formData.nationality
    )?._id;
    const positionId = positions.find((p) => p.name === formData.position)?._id;
    const teamId = teams.find((t) => t.name === formData.wantedTeam)?._id;

    if (file) {
      data.append('photo', {
        uri: file.uri,
        type: 'image/jpeg',
        name: file.fileName || 'photo.jpg',
      });
    }

    data.append('name', formData.name);
    data.append('surname', formData.surname);
    data.append('user', currentUser._id);
    data.append('bio', formData.bio);
    data.append('nationality', countryId || formData.nationality);
    data.append('height', formData.height);
    data.append('weight', formData.weight);
    data.append('age', formData.age);
    data.append('number', formData.number);
    data.append('footed', formData.footed);
    data.append('position', positionId || formData.position);
    data.append('wantedTeam', teamId || formData.wantedTeam);

    try {
      const res = await api.post(`/api/player/add`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Player profile updated successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: 'Failed to update player profile',
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
                    player?.imageUrl ||
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
                  keyboardType='default'
                />
              </View>
              <View className='flex-1'>
                <FormField
                  control={control}
                  name='surname'
                  title='Last Name'
                  placeholder='Doe'
                  keyboardType='default'
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
                      setSelected={onChange}
                      data={formattedCountries}
                      save='value'
                      placeholder='Select Nationality'
                      searchPlaceholder='Search...'
                      boxStyles={{
                        borderColor: errors.nationality ? '#EF4444' : '#E5E7EB',
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 16,
                        backgroundColor: '#F9FAFB',
                      }}
                      dropdownStyles={{
                        borderColor: '#E5E7EB',
                        borderRadius: 8,
                        marginTop: 4,
                      }}
                      defaultOption={formattedCountries.find(
                        (c) => c.key === value
                      )}
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

            {/* Team Selection */}
            <View>
              <View className='flex-row items-center justify-between mb-2'>
                <Text className='text-sm font-medium text-gray-700'>
                  {player?.currentTeam ? 'Current Team' : 'Preferred Team'}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    showInfoAlert(
                      player?.currentTeam
                        ? 'To change your current team, contact your coach'
                        : 'Choosing a team will notify the coach'
                    )
                  }
                >
                  <Icon name='info-circle' size={16} color='#6B7280' />
                </TouchableOpacity>
              </View>
              {player?.currentTeam ? (
                <FormField
                  control={control}
                  name='currentTeam'
                  placeholder={player?.currentTeam?.name || 'No team'}
                  editable={false}
                  inputStyles='bg-gray-100'
                />
              ) : (
                <Controller
                  control={control}
                  name='wantedTeam'
                  render={({ field: { onChange, value } }) => (
                    <SelectList
                      setSelected={onChange}
                      data={formattedTeams}
                      save='value'
                      placeholder='Select Preferred Team'
                      search={false}
                      boxStyles={{
                        borderColor: errors.wantedTeam ? '#EF4444' : '#E5E7EB',
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 16,
                        backgroundColor: '#F9FAFB',
                      }}
                      defaultOption={formattedTeams.find(
                        (t) => t.key === value
                      )}
                    />
                  )}
                />
              )}
            </View>

            {/* Stats Grid */}
            <View className='flex-row flex-wrap justify-between'>
              <View className='w-[48%] mb-4'>
                <FormField
                  control={control}
                  name='height'
                  title='Height (cm)'
                  placeholder='180'
                  keyboardType='numeric'
                />
              </View>
              <View className='w-[48%] mb-4'>
                <FormField
                  control={control}
                  name='weight'
                  title='Weight (kg)'
                  placeholder='75'
                  keyboardType='numeric'
                />
              </View>
              <View className='w-[48%] mb-4'>
                <FormField
                  control={control}
                  name='age'
                  title='Age'
                  placeholder='25'
                  keyboardType='numeric'
                />
              </View>
              <View className='w-[48%] mb-4'>
                <FormField
                  control={control}
                  name='number'
                  title='Jersey Number'
                  placeholder='10'
                  keyboardType='numeric'
                />
              </View>
            </View>

            {/* Position and Footed */}
            <View className='flex-row justify-between'>
              <View className='w-[48%]'>
                <Text className='text-sm font-medium text-gray-700 mb-2'>
                  Position
                </Text>
                <Controller
                  control={control}
                  name='position'
                  render={({ field: { onChange, value } }) => (
                    <SelectList
                      setSelected={onChange}
                      data={formattedPositions}
                      save='value'
                      search={false}
                      placeholder='Select Position'
                      boxStyles={{
                        borderColor: errors.position ? '#EF4444' : '#E5E7EB',
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 16,
                        backgroundColor: '#F9FAFB',
                      }}
                      defaultOption={formattedPositions.find(
                        (p) => p.key === value
                      )}
                    />
                  )}
                />
              </View>
              <View className='w-[48%]'>
                <Text className='text-sm font-medium text-gray-700 mb-2'>
                  Preferred Foot
                </Text>
                <Controller
                  control={control}
                  name='footed'
                  render={({ field: { onChange, value } }) => (
                    <SelectList
                      setSelected={onChange}
                      data={formattedFooted}
                      save='value'
                      placeholder='Select Foot'
                      search={false}
                      boxStyles={{
                        borderColor: errors.footed ? '#EF4444' : '#E5E7EB',
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 16,
                        backgroundColor: '#F9FAFB',
                      }}
                      defaultOption={formattedFooted.find(
                        (f) => f.key === value
                      )}
                    />
                  )}
                />
              </View>
            </View>

            <CustomButton
              title='Save Changes'
              handlePress={handleSubmit(onSubmit)}
              containerStyles='w-full mt-6'
              textStyles='font-medium'
              isLoading={isSaving}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PlayerProfile;
