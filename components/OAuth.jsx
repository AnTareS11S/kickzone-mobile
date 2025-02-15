import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import {
  ANDROID_GOOGLE_CLIENT_ID,
  IOS_GOOGLE_CLIENT_ID,
  WEB_GOOGLE_CLIENT_ID,
} from '@env';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/userSlice';
import Icon from 'react-native-vector-icons/FontAwesome';

WebBrowser.maybeCompleteAuthSession();

const OAuth = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_GOOGLE_CLIENT_ID,
    iosClientId: IOS_GOOGLE_CLIENT_ID,
    webClientId: WEB_GOOGLE_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      getUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  const getUserInfo = async (token) => {
    try {
      const userInfoResponse = await api.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userInfo = await userInfoResponse.json();

      handleGoogleAuth(userInfo);
    } catch (error) {
      console.error('Error fetching user info:', error);
      Alert.alert('Error', 'Failed to get user information from Google');
    }
  };

  // Handle Google authentication response
  const handleGoogleAuth = async (userInfo) => {
    console.log(userInfo);
    try {
      // Authenticate with backend
      const res = await api.post('/api/auth/google-auth', {
        email: userInfo.email,
        name: userInfo.name,
        photo: userInfo.picture,
      });

      const data = res.data;

      // Securely store user  info
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));

      dispatch(signInSuccess(data));

      // Navigate based on onboarding status
      if (!res.data.isOnboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/home');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert(
        'Login Error',
        error.response?.data?.message || 'Authentication failed'
      );
    }
  };

  // Initiate Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google Sign-In Prompt Error', error);
      Alert.alert('Error', 'Could not initiate Google Sign-In');
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        className='flex-row items-center justify-center my-4
                    bg-white border border-gray-300
                    rounded-xl p-3 space-x-2'
      >
        <Icon name='google' size={24} color='black' />
        <Text className='text-black font-semibold'>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OAuth;
