import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import api from '../../lib/api';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { PostFormSchema } from '../../lib/validation';

const CreateForm = () => {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PostFormSchema(false)),
    defaultValues: {
      title: '',
      postContent: '',
      postPhoto: null,
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
      setPreviewUrl(result.assets[0].uri);
      setValue('postPhoto', result.assets[0], { shouldValidate: true });
    }
  };

  const onSubmit = async (formData) => {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('postContent', formData.postContent);

    if (file) {
      const fileToUpload = {
        uri: file.uri,
        type: 'image/jpeg',
        name: file.fileName || 'photo.jpg',
      };
      data.append('postPhoto', fileToUpload);
    }

    data.append('author', currentUser._id);

    setLoading(true);
    try {
      const res = await api.post('/api/post/add', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Post created successfully',
          visibilityTime: 4000,
        });
        reset({
          title: '',
          postContent: '',
          postPhoto: null,
        });
        setPreviewUrl('');
        setFile(null);
        router.push('/home');
      } else {
        console.error('Post creation failed');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to upload images.');
        }
      }
    })();
  }, []);

  return (
    <ScrollView className='flex-1 p-4'>
      <View className='bg-white rounded-xl shadow-lg'>
        <View className='bg-blue-500 p-4 flex-row items-center'>
          <Icon name='edit' size={24} color='white' className='mr-3' />
          <Text className='text-2xl font-bold text-white'>Create New Post</Text>
        </View>

        <View className='p-4'>
          <FormField
            control={control}
            name='title'
            title='Title'
            placeholder='Enter your title'
          />

          <FormField
            control={control}
            name='postContent'
            title='Content'
            placeholder='Enter your content'
          />

          <Controller
            control={control}
            name='postPhoto'
            render={({ field: { onChange, value } }) => (
              <View>
                <TouchableOpacity
                  onPress={pickImage}
                  className='bg-gray-100 p-4 rounded-lg mb-4'
                >
                  <Text>Select Photo</Text>
                </TouchableOpacity>
                {errors.postPhoto && (
                  <Text className='text-red-500 mb-4'>
                    {errors.postPhoto.message}
                  </Text>
                )}
                {previewUrl ? (
                  <Image
                    source={{ uri: previewUrl }}
                    className='w-20 h-20 rounded-lg self-center mb-4'
                  />
                ) : null}
              </View>
            )}
          />

          <CustomButton
            title='Publish Post'
            handlePress={handleSubmit(onSubmit)}
            containerStyles='w-full'
            isLoading={loading}
            disabled={!!loading}
            sendingIndicator='Publishing...'
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateForm;
