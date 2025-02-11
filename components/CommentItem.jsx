import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';
import api from '../lib/api';
import Toast from 'react-native-toast-message';

const LIKE_THROTTLE_DELAY = 300;

const CommentItem = ({ comment, currentUser, onRefresh, level = 0 }) => {
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.postContent);
  const [commentData, setCommentData] = useState({
    likes: comment.likes || [],
    isLiked: comment.likes?.includes(currentUser?._id) || false,
  });

  const isAuthor = currentUser?._id === comment.author?._id;

  const handleLike = async () => {
    if (!currentUser?._id) {
      router.replace('/sign-in');
      return;
    }

    if (isLikeProcessing) return;

    setIsLikeProcessing(true);

    try {
      const isLiked = commentData.isLiked;
      const endpoint = `/api/post/${isLiked ? 'unlike' : 'like'}/${
        comment._id
      }`;

      const res = await api.post(endpoint, {
        userId: currentUser._id,
      });

      if (res.status === 200) {
        setCommentData((prev) => ({
          likes: isLiked
            ? prev.likes.filter((likeId) => likeId !== currentUser._id)
            : [...prev.likes, currentUser._id],
          isLiked: !isLiked,
        }));
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    } finally {
      setTimeout(() => setIsLikeProcessing(false), LIKE_THROTTLE_DELAY);
    }
  };

  const handleReply = async () => {
    if (!currentUser?._id) {
      router.replace('/sign-in');
      return;
    }

    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/post/comment/${comment._id}`, {
        author: currentUser._id,
        commentContent: replyContent.trim(),
      });

      if (res.status === 200) {
        setReplyContent('');
        setShowReplyInput(false);
        onRefresh();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/post/comment/edit/${comment._id}`, {
        post: editContent.trim(),
      });

      if (res.status === 200) {
        setIsEditing(false);
        onRefresh();
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
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
              const res = await api.delete(`/api/post/delete/${comment._id}`);
              if (res.status === 200) {
                onRefresh();
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Comment deleted successfully',
                  visibilityTime: 4000,
                });
              }
            } catch (error) {
              console.error('Error deleting comment:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ marginLeft: level * 20 }} className='mb-4'>
      <View className='bg-white p-4 rounded-lg'>
        <View className='flex-row items-center justify-between mb-2'>
          <View className='flex-row items-center space-x-2'>
            <Text className='text-sm font-semibold text-gray-800'>
              {comment.author?.username}
            </Text>
            <Text className='text-xs text-gray-500'>
              {new Date(comment.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {isAuthor && (
            <View className='flex-row space-x-2'>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                className='p-1'
              >
                <Feather name='edit-2' size={16} color='#666' />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} className='p-1'>
                <Feather name='trash-2' size={16} color='#666' />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isEditing ? (
          <View className='mb-3'>
            <TextInput
              className='bg-gray-50 p-2 rounded-lg border border-gray-200 mb-2'
              value={editContent}
              onChangeText={setEditContent}
              multiline
            />
            <View className='flex-row justify-end space-x-2'>
              <TouchableOpacity
                className='px-3 py-1 rounded-lg bg-gray-200'
                onPress={() => setIsEditing(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-3 py-1 rounded-lg bg-blpurpleue-500 ${
                  !editContent.trim() || isSubmitting ? 'opacity-50' : ''
                }`}
                onPress={handleEdit}
                disabled={!editContent.trim() || isSubmitting}
              >
                <Text className='text-white'>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text className='text-gray-600 mb-3'>{comment.postContent}</Text>
        )}

        <View className='flex-row items-center space-x-4'>
          <TouchableOpacity
            className={`flex-row items-center space-x-1 ${
              commentData.isLiked ? 'text-red-500' : 'text-gray-500'
            } ${!currentUser?._id || isLikeProcessing ? 'opacity-50' : ''}`}
            onPress={handleLike}
            disabled={!currentUser?._id || isLikeProcessing}
          >
            {commentData.isLiked ? (
              <AntDesign name='heart' color='#f00' size={16} />
            ) : (
              <AntDesign name='hearto' color='#888' size={16} />
            )}
            <Text className='text-gray-600 text-sm'>
              {commentData.likes.length || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row items-center space-x-1'
            onPress={() => setShowReplyInput(!showReplyInput)}
          >
            <Feather name='message-circle' color='#888' size={16} />
            <Text className='text-gray-600 text-sm'>
              {comment.children?.length || 0}
            </Text>
          </TouchableOpacity>
        </View>

        {showReplyInput && (
          <View className='mt-3 flex-row items-center space-x-2'>
            <TextInput
              className='flex-1 bg-gray-50 p-2 rounded-lg border border-gray-200'
              placeholder='Write a reply...'
              value={replyContent}
              onChangeText={setReplyContent}
              multiline
            />
            <TouchableOpacity
              className={`bg-purple-500 p-2 rounded-lg ${
                !replyContent.trim() || isSubmitting ? 'opacity-50' : ''
              }`}
              onPress={handleReply}
              disabled={!replyContent.trim() || isSubmitting}
            >
              <Text className='text-white font-semibold'>Reply</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Nested comments */}
      {comment.children?.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          currentUser={currentUser}
          onRefresh={onRefresh}
          level={level + 1}
        />
      ))}
    </View>
  );
};

export default CommentItem;
