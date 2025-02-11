import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TeamResult from '../../components/TeamResult';
import TeamMatches from '../../components/TeamMatches';
import TeamSquad from '../../components/TeamSquad';
import TeamStats from '../../components/TeamStats';

const Tab = createMaterialTopTabNavigator();

const TeamDetails = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { id: teamId } = useLocalSearchParams();
  const router = useRouter();
  const {
    data: team,
    isLoading: loading,
    refetch,
  } = useFetch(`/api/team/${teamId}`);
  const [isFan, setIsFan] = useState(false);

  useEffect(() => {
    const checkIfFan = async () => {
      try {
        const res = await api.post(`/api/team/is-fan/${teamId}`, {
          userId: currentUser?._id,
        });
        setIsFan(res.data.isFan);
      } catch (error) {
        console.error('Error checking fan status:', error);
      }
    };

    if (currentUser && teamId) {
      checkIfFan();
    }
  }, [currentUser, teamId]);

  const handleFollowAction = async (action) => {
    try {
      const res = await api.post(`/api/team/${action}/${teamId}`, {
        userId: currentUser?._id,
      });

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: `You are now ${
            action === 'follow' ? 'following' : 'no longer following'
          } this team`,
        });
        refetch();
        setIsFan(action === 'follow');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: `Failed to ${action} team`,
      });
    }
  };

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-50'>
      <View className='p-4'>
        {/* Header Section */}
        <Animated.View
          entering={FadeIn.duration(500)}
          className='flex-row items-start justify-between mb-6'
        >
          <View className='flex-1 mr-4'>
            <Text className='text-2xl font-bold text-gray-900 mb-2'>
              {team?.name}
            </Text>
            <View className='flex-row items-center mb-4'>
              <Icon name='people' size={20} color='#6B7280' />
              <Text className='ml-2 text-base text-gray-600'>
                {team?.fans?.length.toLocaleString()} fans
              </Text>
            </View>

            {currentUser && (
              <View className='flex-row gap-3'>
                <TouchableOpacity
                  className={`px-2 rounded-xl bg-purple-600 flex-row items-center ${
                    isFan ? 'opacity-50' : ''
                  }`}
                  onPress={() => handleFollowAction('follow')}
                  disabled={isFan}
                >
                  <Icon name='favorite' size={15} color='white' />
                  <Text className='text-white font-semibold ml-2'>Follow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-2 px-2 rounded-xl bg-red-600 flex-row items-center ${
                    !isFan ? 'opacity-50' : ''
                  }`}
                  onPress={() => handleFollowAction('unfollow')}
                  disabled={!isFan}
                >
                  <Icon name='favorite-border' size={15} color='white' />
                  <Text className='text-white font-semibold ml-2'>
                    Unfollow
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Animated.View
            entering={FadeInRight.duration(500)}
            className='w-24 h-24 rounded-full overflow-hidden border-4 border-purple-100'
          >
            <Image
              source={{
                uri:
                  team?.logoUrl ||
                  'https://d3awt09vrts30h.cloudfront.net/team_img_default.png',
              }}
              className='w-full h-full'
              resizeMode='cover'
            />
          </Animated.View>
        </Animated.View>

        {/* Bio Section */}
        <Text className='text-base text-gray-600 mb-4 leading-6'>
          {team?.bio}
        </Text>

        {/* Team Info Sections */}
        <View className='flex-row '>
          <View className='flex-1'>
            <InfoItem icon='event' label='Founded' value={team?.yearFounded} />
            <InfoItem
              icon='stadium'
              label='Stadium'
              value={team?.stadium?.name}
              onPress={() => router.push(`/stadium/${team?.stadium?._id}`)}
              isLink
            />
            <InfoItem
              icon='public'
              label='Country'
              value={team?.country?.name}
            />
          </View>
          <View className='flex-1'>
            <InfoItem
              icon='emoji-events'
              label='League'
              value={team?.league?.name}
            />
            <InfoItem
              icon='person'
              label='Coach'
              value={`${team?.coach?.name} ${team?.coach?.surname}`}
              onPress={() => router.push(`/coach/${team?.coach?._id}`)}
              isLink
            />
          </View>
        </View>
      </View>

      {/* Tabs Navigation */}
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarIndicatorStyle: { backgroundColor: '#6B46C1' },
          tabBarStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: 'white',
            borderRadius: 12,
          },
          lazy: true,
        }}
      >
        <Tab.Screen
          name='Results'
          component={TeamResult}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name='scoreboard' size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name='Matches'
          component={TeamMatches}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name='calendar-today' size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name='Squad'
          component={TeamSquad}
          options={{
            tabBarIcon: ({ color }) => (
              <IconFA name='users' size={20} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name='Stats'
          component={TeamStats}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name='poll' size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const InfoItem = ({ icon, label, value, onPress, isLink }) => {
  const content = (
    <View className='mb-2'>
      <View className='flex-row items-center mb-1'>
        <Icon name={icon} size={20} color='#6B46C1' />
        <Text className='ml-2 text-sm font-medium text-gray-500'>{label}</Text>
      </View>
      <Text
        className={`text-base ${isLink ? 'text-purple-600' : 'text-gray-900'}`}
      >
        {value}
      </Text>
    </View>
  );

  if (isLink && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default TeamDetails;
