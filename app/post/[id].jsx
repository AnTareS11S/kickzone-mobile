import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import useFetch from '../../hooks/useFetch';
import api from '../../lib/api';
import CommentItem from '../../components/CommentItem';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { yupResolver } from '@hookform/resolvers/yup';
import { PostFormSchema } from '../../lib/validation';
import { useForm } from 'react-hook-form';
import FormField from '../../components/FormField';

const LIKE_THROTTLE_DELAY = 300;

const PostDetails = () => {
  const { id } = useLocalSearchParams();
  const { currentUser } = useSelector((state) => state.user);
  const { data: post, isLoading, refetch } = useFetch(`api/post/get/${id}`);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState(null);
  const [postData, setPostData] = useState({
    likes: [],
    isLiked: false,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(PostFormSchema(true)),
    defaultValues: {
      title: '',
      postContent: '',
      postPhoto: null,
    },
  });

  // Update likes and edited content when post data changes
  useEffect(() => {
    if (post) {
      setPostData({
        likes: post.likes || [],
        isLiked: post.likes?.includes(currentUser?._id) || false,
      });
      reset({
        title: post.title,
        postContent: post.postContent,
        postPhoto: post.imageUrl,
      });
      setEditedImage(post.imageUrl);
    }
  }, [post, currentUser?._id]);

  const isAuthor = currentUser?._id === post?.author?._id;

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setEditedImage(result.assets[0].uri);
        setValue('postPhoto', result.assets[0], { shouldValidate: true });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
        visibilityTime: 4000,
      });
    }
  };

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
        refetch();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (formData) => {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('postContent', formData.postContent);

    if (editedImage && editedImage !== post.imageUrl) {
      const fileToUpload = {
        uri: editedImage,
        type: 'image/jpeg',
        name: 'photo.jpg',
      };
      data.append('postPhoto', fileToUpload);
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/post/edit/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Post updated successfully',
          visibilityTime: 4000,
        });
        setIsEditing(false);
        refetch();
      }
    } catch (error) {
      console.error('Error updating post:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update post',
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.delete(`/api/post/delete/${id}`);
              if (res.status === 200) {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Post deleted successfully',
                  visibilityTime: 4000,
                });
                router.replace('/home');
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete post',
                visibilityTime: 4000,
              });
            }
          },
        },
      ]
    );
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
          {isEditing ? (
            <View className='mb-4'>
              {/* Image Edit Section */}
              <TouchableOpacity
                onPress={pickImage}
                className='w-full h-48 rounded-xl mb-4 justify-center items-center'
                style={{
                  backgroundColor: editedImage ? 'transparent' : '#f0f0f0',
                }}
              >
                {editedImage ? (
                  <Image
                    source={{ uri: editedImage }}
                    className='w-full h-48 rounded-xl object-cover'
                  />
                ) : (
                  <View className='items-center'>
                    <MaterialIcons
                      name='add-photo-alternate'
                      size={40}
                      color='#666'
                    />
                    <Text className='text-gray-600 mt-2'>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {editedImage && (
                <TouchableOpacity
                  onPress={() => setEditedImage(null)}
                  className='absolute right-2 top-2 bg-black/50 rounded-full p-1'
                >
                  <MaterialIcons name='close' size={20} color='white' />
                </TouchableOpacity>
              )}

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

              <View className='flex-row justify-end space-x-2 mt-2'>
                <TouchableOpacity
                  className='bg-gray-500 p-2 rounded-lg'
                  onPress={() => {
                    setIsEditing(false);
                    setEditedImage(post.imageUrl);
                    reset();
                  }}
                >
                  <Text className='text-white'>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className='bg-purple-500 p-2 rounded-lg'
                  onPress={handleSubmit(handleEdit)}
                  disabled={isSubmitting}
                >
                  <Text className='text-white'>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {(post.imageUrl || editedImage) && (
                <Image
                  source={{ uri: editedImage || post.imageUrl }}
                  className='w-full h-48 rounded-xl object-cover mb-4'
                />
              )}

              <View className='flex-row justify-between items-start mb-2'>
                <Text className='text-2xl font-bold text-gray-800 flex-1'>
                  {post.title}
                </Text>
                {isAuthor && (
                  <View className='flex-row space-x-2'>
                    <TouchableOpacity
                      onPress={() => setIsEditing(true)}
                      className='p-2'
                    >
                      <MaterialIcons name='edit' size={24} color='#666' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} className='p-2'>
                      <MaterialIcons name='delete' size={24} color='#ff4444' />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

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
            </>
          )}

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
                className={`bg-purple-500 p-3 rounded-lg ${
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
