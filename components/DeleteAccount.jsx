import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
} from '../redux/userSlice';
import api from '../lib/api';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

const DeleteAccount = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const showDeleteConfirmation = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: handleDeleteUser,
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeleteUser = async () => {
    setIsLoading(true);
    try {
      dispatch(deleteUserStart());
      const res = await api.delete(`/api/user/delete/${currentUser._id}`);
      const data = await res.data;
      if (res.status === 200) {
        dispatch(deleteUserSuccess());
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your account has been deleted',
        });
        router.replace('/sign-in');
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className='bg-white rounded-lg p-6 shadow-sm'>
      <Text className='text-xl font-bold mb-4 text-gray-900'>
        Account Settings
      </Text>
      <View className='mb-6'>
        <Text className='text-lg font-medium text-gray-900'>
          Delete Account
        </Text>
        <Text className='text-gray-500'>
          Delete your account and remove your data from our servers.
        </Text>
      </View>

      <TouchableOpacity
        onPress={showDeleteConfirmation}
        disabled={isLoading}
        className={`py-3 px-4 rounded-md ${
          isLoading ? 'bg-red-300' : 'bg-red-500'
        }`}
      >
        <Text className='text-white font-bold text-center'>
          {isLoading ? 'Processing...' : 'Delete Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DeleteAccount;
