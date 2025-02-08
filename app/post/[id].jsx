import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import useFetch from '../../hooks/useFetch';
import api from '../../lib/api';
import CommentItem from '../../components/CommentItem';

const LIKE_THROTTLE_DELAY = 300;

const PostDetails = () => {
  const { id } = useLocalSearchParams();
  const { currentUser } = useSelector((state) => state.user);
  const { data: post, isLoading, refetch } = useFetch(`api/post/get/${id}`);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState({
    likes: [],
    isLiked: false,
  });

  // Update likes when post data changes
  useEffect(() => {
    if (post) {
      setPostData({
        likes: post.likes || [],
        isLiked: post.likes?.includes(currentUser?._id) || false,
      });
    }
  }, [post, currentUser?._id]);

  const handleLike = useCallback(async () => {
    if (!currentUser._id) {
      router.replace('/sign-in');
      return;
    }

    if (isLikeProcessing) return;

    setIsLikeProcessing(true);

    try {
      const isLiked = postData.isLiked;
      const endpoint = `/api/post/${isLiked ? 'unlike' : 'like'}/${id}`;

      const res = await api.post(endpoint, {
        userId: currentUser._id,
      });

      if (res.status === 200) {
        setPostData((prev) => ({
          likes: isLiked
            ? prev.likes.filter((likeId) => likeId !== currentUser._id)
            : [...prev.likes, currentUser._id],
          isLiked: !isLiked,
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setTimeout(() => setIsLikeProcessing(false), LIKE_THROTTLE_DELAY);
    }
  }, [currentUser?._id, id, postData.isLiked, isLikeProcessing]);

  const handleAddComment = async () => {
    if (!currentUser._id) {
      router.replace('/sign-in');
      return;
    }

    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/post/comment/${id}`, {
        author: currentUser._id,
        commentContent: newComment.trim(),
      });

      if (res.status === 200) {
        setNewComment('');
        refetch(); // Refresh post data to get new comment
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <ActivityIndicator size='large' color='#0000ff' />
      </View>
    );
  }

  if (!post) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <Text className='text-gray-600 text-lg'>Post not found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className='flex-1 bg-gray-50'>
        <View className='p-4'>
          {post.imageUrl && (
            <Image
              source={{ uri: post.imageUrl }}
              className='w-full h-48 rounded-xl object-cover mb-4'
            />
          )}

          <Text className='text-2xl font-bold text-gray-800 mb-2'>
            {post.title}
          </Text>

          <View className='flex-row items-center space-x-2 mb-4'>
            <Text className='text-sm text-gray-500'>
              {post.author?.username}
            </Text>
            <View className='w-1 h-1 bg-gray-300 rounded-full' />
            <Text className='text-sm text-gray-500'>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <Text className='text-gray-600 mb-6'>{post.postContent}</Text>

          <View className='flex-row items-center space-x-4 mb-6'>
            <TouchableOpacity
              className={`flex-row items-center space-x-1 ${
                postData.isLiked ? 'text-red-500' : 'text-gray-500'
              } ${!currentUser?._id || isLikeProcessing ? 'opacity-50' : ''}`}
              onPress={handleLike}
              disabled={!currentUser?._id || isLikeProcessing}
            >
              {postData.isLiked ? (
                <AntDesign name='heart' color='#f00' size={20} />
              ) : (
                <AntDesign name='hearto' color='#888' size={20} />
              )}
              <Text className='text-gray-600'>
                {postData.likes.length || 0}
              </Text>
            </TouchableOpacity>

            <View className='flex-row items-center space-x-1'>
              <Feather name='message-circle' color='#888' size={20} />
              <Text className='text-gray-600'>
                {post.children?.length || 0}
              </Text>
            </View>
          </View>

          {/* Comments Section */}
          <View className='mb-4 px-4'>
            <Text className='text-lg font-semibold text-gray-800 mb-4'>
              Comments
            </Text>

            {/* Add Comment Input */}
            <View className='flex-row items-center space-x-2 mb-6'>
              <TextInput
                className='flex-1 bg-white p-3 rounded-lg border border-gray-200'
                placeholder='Add a comment...'
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                className={`bg-blue-500 p-3 rounded-lg ${
                  !newComment.trim() || isSubmitting ? 'opacity-50' : ''
                }`}
                onPress={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                <Text className='text-white font-semibold'>Post</Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {post.children?.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUser={currentUser}
                onRefresh={refetch}
                level={0}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default PostDetails;
