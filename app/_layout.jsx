import { SplashScreen, Stack } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { store } from '../redux/store';
import { Provider } from 'react-redux';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerGlobalRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerGlobalRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#10B981', // Emerald-500
        backgroundColor: '#F0FDF4', // Emerald-50
        borderRadius: 8,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#065F46', // Emerald-900
      }}
      text2Style={{
        fontSize: 14,
        color: '#047857', // Emerald-700
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#EF4444', // Red-500
        backgroundColor: '#FEF2F2', // Red-50
        borderRadius: 8,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#7F1D1D', // Red-900
      }}
      text2Style={{
        fontSize: 14,
        color: '#B91C1C', // Red-700
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    />
  ),
};

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
    <>
      <Provider store={store}>
        <RefreshProvider>
          <Stack>
            <Stack.Screen
              name='index'
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name='(auth)'
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name='(tabs)'
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name='post/[id]'
              options={{
                title: 'Post Details',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='league/[id]'
              options={({ route }) => ({
                title: route.params.name,
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              })}
            />
            <Stack.Screen
              name='team/[id]'
              options={{
                title: '',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='player/[id]'
              options={{
                title: '',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='coach/[id]'
              options={{
                title: '',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='referee/[id]'
              options={{
                title: '',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='stadium/[id]'
              options={{
                title: '',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='result/[id]'
              options={{
                title: '',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='match/[id]'
              options={{
                title: '',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='about/index'
              options={{
                title: 'About Us',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='faq/index'
              options={{
                title: 'FAQ',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='contact/index'
              options={{
                title: 'Contact',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='privacy/index'
              options={{
                title: 'Privacy Policy',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='explore/index'
              options={{
                title: 'Explore',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='profile/index'
              options={{
                title: 'Profile',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='settings/index'
              options={{
                title: 'Settings',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name='training/[id]'
              options={{
                title: 'Training Details',
                animation: 'slide_from_right',
                headerBackTitle: 'Back',
              }}
            />
          </Stack>

          <Toast config={toastConfig} />
        </RefreshProvider>
      </Provider>
    </>
  );
};

export default RootLayout;
