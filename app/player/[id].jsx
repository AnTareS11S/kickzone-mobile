import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import Toast from 'react-native-toast-message';

const StatCard = ({ label, value, icon }) => (
  <View className='bg-white p-4 rounded-lg shadow-sm'>
    <View className='flex-row items-center justify-between mb-2'>
      {icon}
      <Text className='text-gray-500 text-sm'>{label}</Text>
    </View>
    <Text className='text-2xl font-bold text-gray-800'>{value}</Text>
  </View>
);

const SeasonStats = ({ stats }) => {
  const statMetrics = [
    {
      label: 'Goals',
      icon: <IconFA name='futbol' size={16} color='#4B5563' />,
      key: 'goals',
    },
    {
      label: 'Assists',
      icon: <IconFA name='hands-helping' size={16} color='#4B5563' />,
      key: 'assists',
    },
    {
      label: 'Yellow Cards',
      icon: <IconMI name='square' size={16} color='#FCD34D' />,
      key: 'yellowCards',
    },
    {
      label: 'Red Cards',
      icon: <IconMI name='square' size={16} color='#EF4444' />,
      key: 'redCards',
    },
    {
      label: 'Clean Sheets',
      icon: <IconFA name='shield-alt' size={16} color='#4B5563' />,
      key: 'cleanSheets',
    },
    {
      label: 'Minutes',
      icon: <IconFA name='clock' size={16} color='#4B5563' />,
      key: 'minutesPlayed',
    },
  ];

  return (
    <View className='mb-6'>
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-xl font-semibold text-gray-700'>
          {stats.season}
        </Text>
        <View className='bg-purple-100 px-3 py-1 rounded-full'>
          <Text className='text-purple-700 font-medium'>{stats.team}</Text>
        </View>
      </View>
      <View className='grid grid-cols-2 gap-4'>
        {statMetrics.map((metric) => (
          <StatCard
            key={metric.key}
            label={metric.label}
            value={stats[metric.key]}
            icon={metric.icon}
          />
        ))}
      </View>
    </View>
  );
};

const PlayerInfo = ({ label, value, icon }) => (
  <View className='flex-row items-center bg-white p-3 rounded-lg shadow-sm'>
    {icon}
    <View className='ml-3'>
      <Text className='text-gray-500 text-sm'>{label}</Text>
      <Text className='text-gray-800 font-medium'>{value}</Text>
    </View>
  </View>
);

const PlayerDetails = () => {
  const { id: playerId } = useLocalSearchParams();
  const { currentUser } = useSelector((state) => state.user);
  const {
    data: player,
    isLoading,
    refetch,
  } = useFetch(`/api/player/${playerId}`);
  const { data: playerStats } = useFetch(
    `/api/player/player-top-stats/${playerId}`
  );
  const [isFan, setIsFan] = useState(false);

  useEffect(() => {
    const checkIfFan = async () => {
      try {
        const res = await api.post(`/api/player/is-fan/${playerId}`, {
          userId: currentUser?._id,
        });
        setIsFan(res.data.isFan);
      } catch (error) {
        console.error('Error checking fan status:', error);
      }
    };

    if (currentUser && playerId) {
      checkIfFan();
    }
  }, [currentUser, playerId]);

  const handleFollowAction = async (action) => {
    try {
      const res = await api.post(`/api/player/${action}/${playerId}`, {
        userId: currentUser?._id,
      });

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: `You are now ${
            action === 'follow' ? 'following' : 'no longer following'
          } this player`,
        });
        refetch();
        setIsFan(action === 'follow');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: `Failed to ${action} player`,
      });
    }
  };

  if (!player) {
    return (
      <View className='flex-1 justify-center items-center'>
        <Text className='text-lg text-gray-700'>Player not found</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  const personalInfo = [
    {
      label: 'Age',
      value: `${player?.age} years`,
      icon: <Icon name='birthday-cake' size={20} color='#6B7280' />,
    },
    {
      label: 'Nationality',
      value: player?.nationality,
      icon: <Icon name='flag' size={20} color='#6B7280' />,
    },
    {
      label: 'Height',
      value: `${player?.height} cm`,
      icon: <IconFA name='ruler-vertical' size={20} color='#6B7280' />,
    },
    {
      label: 'Weight',
      value: `${player?.weight} kg`,
      icon: <IconFA name='weight' size={20} color='#6B7280' />,
    },
  ];

  return (
    <ScrollView className='bg-gray-50'>
      {/* Header Section */}
      <View className='bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-b-3xl mb-6'>
        <View className='items-center'>
          <Image
            source={{
              uri:
                player?.imageUrl ||
                'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
            }}
            className='w-32 h-32 rounded-full border-4 border-white mb-4'
          />
          <Text className='text-3xl font-bold '>{`${player?.name} ${player?.surname}`}</Text>
          <Text className='text-lg  opacity-90 mb-2'>{`${player?.position} | ${player?.currentTeam}`}</Text>
          <Text className='opacity-80 mb-4'>{`${player?.fans?.length} fans`}</Text>

          {currentUser && (
            <View className='flex-row gap-3'>
              <TouchableOpacity
                className={`px-4 py-2 rounded-xl bg-purple-600 flex-row items-center ${
                  isFan ? 'opacity-50' : ''
                }`}
                onPress={() => handleFollowAction('follow')}
                disabled={isFan}
              >
                <IconMI name='favorite' size={15} color='white' />
                <Text className='text-white font-semibold ml-2'>Follow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-xl bg-red-500 flex-row items-center ${
                  !isFan ? 'opacity-50' : ''
                }`}
                onPress={() => handleFollowAction('unfollow')}
                disabled={!isFan}
              >
                <IconMI name='favorite-border' size={15} color='white' />
                <Text className='text-white font-semibold ml-2'>Unfollow</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Personal Information Section */}
      <View className='px-4 mb-6'>
        <Text className='text-xl font-semibold text-gray-700 mb-4'>
          Personal Information
        </Text>
        <View className='grid grid-cols-2 gap-4'>
          {personalInfo.map((info, index) => (
            <PlayerInfo
              key={index}
              label={info.label}
              value={info.value}
              icon={info.icon}
            />
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View className='px-4'>
        <Text className='text-xl font-semibold text-gray-700 mb-4'>
          Career Statistics
        </Text>
        {playerStats.length === 0 && (
          <Text className='text-gray-500 mb-3'>No stats available</Text>
        )}

        {playerStats.map((seasonStats, index) => (
          <SeasonStats key={index} stats={seasonStats} />
        ))}
      </View>
    </ScrollView>
  );
};

export default PlayerDetails;
