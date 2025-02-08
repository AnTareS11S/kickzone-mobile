import React, { useCallback, useEffect, useState } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import api from '../../lib/api';
import { useSelector } from 'react-redux';

const LIKE_THROTTLE_DELAY = 300;

const Home = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { data: posts, isLoading, refetch } = useFetch('api/post/all');
  const [postLikes, setPostLikes] = useState({});
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [comments, setComments] = useState({});

  // Refresh posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Update likes when posts data changes
  useEffect(() => {
    if (posts && Array.isArray(posts)) {
      const newPostLikes = {};
      const newComments = {};
      posts.forEach((post) => {
        newPostLikes[post._id] = {
          likes: post.likes || [],
          isLiked: post.likes?.includes(currentUser?._id) || false,
        };
        newComments[post._id] = post.children || [];
      });
      setComments(newComments);
      setPostLikes(newPostLikes);
    }
  }, [posts, currentUser?._id]);

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

  const handleLike = useCallback(
    async (id) => {
      if (!currentUser._id) {
        router.replace('/sign-in');
        return;
      }

      if (isLikeProcessing) return;

      setIsLikeProcessing(true);

      try {
        const isLiked = postLikes[id]?.isLiked;
        const endpoint = `/api/post/${isLiked ? 'unlike' : 'like'}/${id}`;

        const res = await api.post(endpoint, {
          userId: currentUser._id,
        });

        if (res.status === 200) {
          setPostLikes((prev) => ({
            ...prev,
            [id]: {
              likes: isLiked
                ? prev[id].likes.filter((id) => id !== currentUser._id)
                : [...prev[id].likes, currentUser._id],
              isLiked: !isLiked,
            },
          }));
        }
      } catch (error) {
        console.error('Error toggling like:', error);
      } finally {
        setTimeout(() => setIsLikeProcessing(false), LIKE_THROTTLE_DELAY);
      }
    },
    [currentUser?._id, postLikes, isLikeProcessing]
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
              className={`flex flex-row items-center space-x-1 ${
                postLikes[item._id]?.isLiked
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-gray-400'
              } ${
                !currentUser?._id || isLikeProcessing
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              onPress={() => handleLike(item._id)}
              disabled={!currentUser?._id || isLikeProcessing}
            >
              {postLikes[item._id]?.isLiked ? (
                <AntDesign name='heart' color='#f00' size={16} />
              ) : (
                <AntDesign name='hearto' color='#888' size={16} />
              )}

              <Text className='text-gray-600 text-sm'>
                {postLikes[item._id]?.likes.length || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className='flex-row items-center space-x-1'>
              <Feather name='message-circle' color='#888' size={16} />
              <Text className='text-gray-600 text-sm'>
                {comments[item._id]?.length || 0}
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
