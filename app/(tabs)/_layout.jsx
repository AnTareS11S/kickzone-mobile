import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { icons, images } from '../../constants';
import { Feather } from '@expo/vector-icons';

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
  const handleMenuPress = () => {
    // Implement your menu open logic here
    // This could be navigation to a sidebar, opening a modal, etc.
    console.log('Menu pressed');
  };

  return (
    <View className='flex-1'>
      <Header onMenuPress={handleMenuPress} />
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
        <Tabs.Screen
          name='home'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name='Home'
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='search/[query]'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.search}
                color={color}
                name='Search'
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='create'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name='Create'
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='profile'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name='Leagues'
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabsLayout;
