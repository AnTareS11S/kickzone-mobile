import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { icons, images } from '../../constants';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import {
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from '../../redux/userSlice';
import api from '../../lib/api';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className='items-center justify-center gap-2 pt-2'>
      <Image
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className='w-5 h-5'
      />
      <Text
        className={`${focused ? 'font-psemibold' : 'font-pregular'} text-[7px]`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

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

const TabsLayout = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const router = useRouter();
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
        router.replace('/sign-in');
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

  const getTabs = () => {
    const baseTabs = [
      {
        name: 'home',
        icon: icons.home,
        label: 'Home',
      },
      {
        name: 'search/[query]',
        icon: icons.search,
        label: 'Search',
      },
    ];

    if (currentUser?.role === 'Coach') {
      return [
        ...baseTabs,
        {
          name: 'training',
          icon: icons.play,
          label: 'Training',
        },
        {
          name: 'create',
          icon: icons.plus,
          label: 'Create',
        },
        {
          name: 'leagues',
          icon: icons.profile,
          label: 'Leagues',
        },
      ];
    } else if (currentUser?.role === 'Player') {
      return [
        ...baseTabs,
        {
          name: 'training',
          icon: icons.play,
          label: 'Training',
        },
        {
          name: 'leagues',
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
          name: 'create',
          icon: icons.plus,
          label: 'Create',
        },
        {
          name: 'leagues',
          icon: icons.profile,
          label: 'Leagues',
        },
      ];
    } else {
      return [
        ...baseTabs,
        {
          name: 'leagues',
          icon: icons.profile,
          label: 'Leagues',
        },
      ];
    }
  };

  const tabsToRender = getTabs();

  return (
    <View className='flex-1'>
      <Header onMenuPress={handleMenuPress} />

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
                  icon='whistle'
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

      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: [
            {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#E2E8F0',
              height: 55,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 5,
            },
            null,
          ],
        }}
      >
        {tabsToRender.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={tab.icon}
                  color={color}
                  name={tab.label}
                  focused={focused}
                />
              ),
            }}
          />
        ))}
      </Tabs>
    </View>
  );
};

export default TabsLayout;
