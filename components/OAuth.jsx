import React, { useState, useEffect } from 'react';
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

WebBrowser.maybeCompleteAuthSession();

const OAuth = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_GOOGLE_CLIENT_ID,
    iosClientId: IOS_GOOGLE_CLIENT_ID,
    webClientId: WEB_GOOGLE_CLIENT_ID,
  });

  // Check for existing user on component mount
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) {
          setUserInfo(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking existing user:', error);
      }
    };
    checkExistingUser();
  }, []);

  // Handle Google authentication response
  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === 'success') {
        try {
          const { authentication } = response;

          // Authenticate with backend
          const res = await api.post('/api/auth/google-auth', {
            token: authentication.accessToken,
          });

          // Extract token from response
          const token =
            res.data.token || res.headers.authorization?.replace('Bearer ', '');

          if (!token) {
            throw new Error('No authentication token received');
          }

          // Securely store token
          await SecureStore.setItemAsync('userToken', token);

          // Store user info
          await AsyncStorage.setItem('@user', JSON.stringify(res.data.user));
          setUserInfo(res.data.user);

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
      }
    };

    handleAuthResponse();
  }, [response, router]);

  // Initiate Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google Sign-In Prompt Error', error);
      Alert.alert('Error', 'Could not initiate Google Sign-In');
    }
  };

  // Logout functionality
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await AsyncStorage.removeItem('@user');
      setUserInfo(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={userInfo ? handleLogout : handleGoogleSignIn}
        className='flex-row items-center justify-center 
                    bg-white border border-gray-300 
                    rounded-xl p-3 space-x-2'
      >
        <Text className='text-black font-semibold'>
          {userInfo ? 'Logout' : 'Continue with Google'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OAuth;
