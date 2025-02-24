import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { icons, images } from '../constants';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import {
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from '../redux/userSlice';
import api from '../lib/api';

const MenuOption = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className='flex-row items-center px-6 py-4 border-b border-gray-200'
    >
      <Feather name={icon} size={20} color='#333' />
      <Text className='ml-4 font-pregular text-base text-gray-800'>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const Header = ({ onMenuPress }) => {
  return (
    <View className='bg-white flex-row items-center justify-between px-4 py-5 mt-5 border-b border-gray-200'>
      <Image source={images.logo} resizeMode='contain' className='w-32 h-8' />
      <TouchableOpacity onPress={onMenuPress} className='p-2'>
        <Feather name='menu' size={24} color='#333' />
      </TouchableOpacity>
    </View>
  );
};

const TabsLayout = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    try {
      dispatch(signOutUserStart());
      const res = await api.post('/api/auth/signout');

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'You have been logged out',
        });
        dispatch(signOutUserSuccess());
        router.replace('/(auth)/sign-in');
      } else {
        const errorMessage =
          res.data?.message || 'An error occurred during sign out';
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
        });
        dispatch(signOutUserFailure(errorMessage));
      }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during sign out';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      dispatch(signOutUserFailure(errorMessage));
    }
  };

  const handleMenuOptionPress = (screen) => {
    setMenuVisible(false);
    // Navigate to the selected screen
    if (screen) {
      router.push(screen);
    }
  };

  // Helper function to get the active tab from segments
  const getActiveTab = () => {
    if (!segments || segments.length < 2) return 'home';

    // If we're in the (tabs) group
    if (segments[0] === '(tabs)') {
      // Get the second segment, or use 'home' if it's the root of (tabs)
      return segments[1] || 'home';
    }

    return 'home';
  };

  // Function to handle tab press with role-based navigation
  const handleTabPress = (tabName) => {
    // Close menu if it's open
    if (menuVisible) {
      setMenuVisible(false);
    }

    if (tabName === 'home') {
      router.push('/home');
    } else if (tabName === 'create') {
      if (
        currentUser?.role === 'Coach' ||
        currentUser?.role === 'Referee' ||
        currentUser?.role === 'Admin'
      ) {
        router.push('/create');
      }
    } else if (tabName === 'search') {
      router.push('/search/[query]');
    } else if (tabName === 'training') {
      router.push('/training');
    } else if (tabName === 'leagues') {
      router.push('/leagues');
    }
  };

  // Get role-specific tabs
  const getRoleTabs = () => {
    // Define the common tabs for all users
    const baseTabs = [
      {
        id: 'home',
        icon: icons.home,
        label: 'Home',
      },
      {
        id: 'search',
        icon: icons.search,
        label: 'Search',
      },
    ];

    if (currentUser?.role === 'Player') {
      return [
        ...baseTabs,
        {
          id: 'training',
          icon: icons.play,
          label: 'Training',
        },
        {
          id: 'leagues',
          icon: icons.profile,
          label: 'Leagues',
        },
      ];
    } else if (currentUser?.role === 'Coach') {
      return [
        ...baseTabs,
        {
          id: 'training',
          icon: icons.play,
          label: 'Training',
        },
        {
          id: 'create',
          icon: icons.plus,
          label: 'Create',
        },
        {
          id: 'leagues',
          icon: icons.profile,
          label: 'Leagues',
        },
      ];
    } else if (
      currentUser?.role === 'Referee' ||
      currentUser?.role === 'Admin'
    ) {
      return [
        ...baseTabs,
        {
          id: 'create',
          icon: icons.plus,
          label: 'Create',
        },
        {
          id: 'leagues',
          icon: icons.profile,
          label: 'Leagues',
        },
      ];
    } else {
      return [
        ...baseTabs,
        {
          id: 'leagues',
          icon: icons.profile,
          label: 'Leagues',
        },
      ];
    }
  };

  // Custom tab bar component
  const CustomTabBar = () => {
    const tabs = getRoleTabs();
    const activeTab = getActiveTab();

    return (
      <View className='flex-row bg-white border-t border-gray-200 h-14 items-center justify-around'>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              className='flex-1 items-center justify-center'
              onPress={() => handleTabPress(tab.id)}
            >
              <View className='items-center justify-center gap-1'>
                <Image
                  source={tab.icon}
                  resizeMode='contain'
                  tintColor={active ? '#2563EB' : '#94A3B8'}
                  className='w-5 h-5'
                />
                <Text
                  className={`${
                    active ? 'font-psemibold' : 'font-pregular'
                  } text-[7px]`}
                  style={{
                    color: active ? '#2563EB' : '#94A3B8',
                  }}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <Header onMenuPress={handleMenuPress} />

      {/* Main content area */}
      <View className='flex-1'>{children}</View>

      {/* Custom Tab Bar */}
      <CustomTabBar />

      {/* Menu Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View className='flex-1 bg-black/30'>
          <Pressable className='flex-1' onPress={() => setMenuVisible(false)} />
          <View className='bg-white rounded-t-2xl shadow-lg'>
            <View className='items-center py-2'>
              <View className='w-10 h-1 bg-gray-300 rounded-full'></View>
            </View>
            <View className='py-4'>
              <MenuOption
                icon='user'
                title='Profile'
                onPress={() => handleMenuOptionPress('/profile')}
              />
              {/* Role-specific options */}
              {currentUser?.role === 'Coach' && (
                <MenuOption
                  icon='clipboard'
                  title='Coach Profile'
                  onPress={() => handleMenuOptionPress('/coach-profile')}
                />
              )}

              {currentUser?.role === 'Player' && (
                <MenuOption
                  icon='activity'
                  title='Player Profile'
                  onPress={() => handleMenuOptionPress('/player-profile')}
                />
              )}

              {currentUser?.role === 'Referee' && (
                <MenuOption
                  icon='user-check'
                  title='Referee Profile'
                  onPress={() => handleMenuOptionPress('/referee-profile')}
                />
              )}

              <MenuOption
                icon='settings'
                title='Settings'
                onPress={() => handleMenuOptionPress('/settings')}
              />
              <MenuOption
                icon='info'
                title='About'
                onPress={() => handleMenuOptionPress('/about')}
              />
              <MenuOption
                icon='compass'
                title='Explore'
                onPress={() => handleMenuOptionPress('/explore')}
              />
              <MenuOption
                icon='help-circle'
                title='FAQ'
                onPress={() => handleMenuOptionPress('/faq')}
              />
              <MenuOption
                icon='mail'
                title='Contact'
                onPress={() => handleMenuOptionPress('/contact')}
              />
              <MenuOption
                icon='shield'
                title='Privacy Policy'
                onPress={() => handleMenuOptionPress('/privacy')}
              />
              <MenuOption
                icon='log-out'
                title='Log Out'
                onPress={handleLogout}
              />
            </View>
            <TouchableOpacity
              className='my-4 mx-6 py-3 bg-gray-200 rounded-lg items-center'
              onPress={() => setMenuVisible(false)}
            >
              <Text className='font-psemibold text-gray-800'>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TabsLayout;
