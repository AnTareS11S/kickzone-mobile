import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const OAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_GOOGLE_CLIENT_ID',
    iosClientId: 'YOUR_IOS_GOOGLE_CLIENT_ID',
    webClientId: 'YOUR_WEB_GOOGLE_CLIENT_ID',
    redirectUri: makeRedirectUri({
      scheme: 'your.app.scheme',
    }),
  });

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();

      if (result.type === 'success') {
        const { authentication } = result;

        // Send token to your backend
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: authentication.accessToken,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Handle successful login (e.g., save user token, navigate)
          console.log('Google Sign-In Successful', data);
        } else {
          // Handle login error
          console.error('Google Sign-In Failed', data);
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error', error);
    }
  };

  return (
    <View className='mt-4 space-y-4'>
      {/* Google Sign-In Button */}
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        className='flex-row items-center justify-center 
                    bg-white border border-gray-300 
                    rounded-xl p-3 space-x-2'
      >
        {/* <Image
          source={require('../../assets/icons/google.png')}
          className='w-6 h-6'
          resizeMode='contain'
        /> */}
        <Text className='text-black font-semibold'>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OAuth;
