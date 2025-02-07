import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  BackHandler,
  Alert,
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import useFetch from '../../hooks/useFetch';
import { useFocusEffect } from 'expo-router';

const Home = () => {
  const { data: posts, isLoading, error, refetch } = useFetch('api/post/all');

  const handleBackPress = () => {
    Alert.alert('Exit App', 'Are you sure you want to exit?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'YES', onPress: () => BackHandler.exitApp() },
    ]);

    return true;
  };

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    })
  );

  const renderPost = ({ item }) => (
    <TouchableOpacity
      className='bg-white rounded-xl shadow-md mb-4 overflow-hidden'
      onPress={() => router.push(`/post/${item._id}`)}
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          className='w-full h-48 object-cover'
        />
      )}

      <View className='p-4'>
        <Text
          className='text-xl font-bold text-gray-800 mb-2'
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <Text className='text-gray-600 mb-3' numberOfLines={2}>
          {item.postContent}
        </Text>

        <View className='flex-row items-center justify-between'>
          <View className='flex-row items-center space-x-2'>
            <Text className='text-sm text-gray-500'>
              {item.author.username}
            </Text>
            <View className='w-1 h-1 bg-gray-300 rounded-full' />
            <Text className='text-sm text-gray-500'>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View className='flex-row items-center space-x-3'>
            <TouchableOpacity
              className='flex-row items-center space-x-1'
              onPress={() => handleLike(item._id)}
            >
              <AntDesign name='hearto' color='#888' size={16} />
              <Text className='text-gray-600 text-sm'>
                {item.likes?.length || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className='flex-row items-center space-x-1'>
              <Feather name='message-circle' color='#888' size={16} />
              <Text className='text-gray-600 text-sm'>
                {item.comments?.length || 0}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <Text className='text-gray-600 text-lg'>Loading...</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-50'>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle='p-4'
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </View>
  );
};

export default Home;
