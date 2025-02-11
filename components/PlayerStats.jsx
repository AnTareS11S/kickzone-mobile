import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';

const PlayerStats = ({ leagueId, type }) => {
  const [playersStats, setPlayersStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchPlayersStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/player/top-stats/${leagueId}`);
      if (res.status === 200) {
        let data = await res.data;
        data = data.filter((player) => {
          switch (type) {
            case 'goals':
              return player.goals > 0;
            case 'assists':
              return player.assists > 0;
            case 'yellowCards':
              return player.yellowCards > 0;
            case 'redCards':
              return player.redCards > 0;
            case 'cleanSheets':
              return player.cleanSheets > 0;
            default:
              return false;
          }
        });
        setPlayersStats(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlayersStats();
  }, [leagueId, type]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPlayersStats();
  }, [leagueId, type]);

  const getStatValue = (player) => {
    switch (type) {
      case 'goals':
        return player.goals;
      case 'assists':
        return player.assists;
      case 'yellowCards':
        return player.yellowCards;
      case 'redCards':
        return player.redCards;
      case 'cleanSheets':
        return player.cleanSheets;
      default:
        return player.goals;
    }
  };

  const renderTableHeader = () => (
    <View className='flex-row bg-gray-100 py-3 border-b border-gray-200'>
      <Text className='w-8 text-center font-semibold text-sm'>#</Text>
      <Text className='flex-1 font-semibold text-sm pl-2'>Player</Text>
      <Text className='flex-1 font-semibold text-sm pl-2'>Team</Text>
      <Text className='w-12 text-center font-semibold text-sm'>
        {type.charAt(0).toUpperCase() +
          type.slice(1).replace(/([A-Z])/g, ' $1')}
      </Text>
    </View>
  );

  const renderPlayerRow = (player, index) => (
    <View
      key={player.playerId}
      className='flex-row items-center py-3 border-b border-gray-100'
    >
      <Text className='w-8 text-center text-sm'>{index + 1}</Text>
      <TouchableOpacity
        className='flex-1 pl-2'
        onPress={() =>
          router.push({
            pathname: `/player/${player.playerId}`,
            params: { name: player.name },
          })
        }
      >
        <Text className='text-sm text-purple-500' numberOfLines={1}>
          {player.name}
        </Text>
      </TouchableOpacity>
      <View className='flex-2 flex-row items-center pl-2'>
        <Image
          source={{ uri: player.logoUrl }}
          className='h-6 w-6 rounded-full'
          resizeMode='contain'
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: `/team/${player.teamId}`,
              params: { name: player.team },
            })
          }
        >
          <Text className='text-sm  ml-2' numberOfLines={1}>
            {player.team}
          </Text>
        </TouchableOpacity>
      </View>
      <Text className='w-12 text-center text-sm'>{getStatValue(player)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className='p-2'
    >
      <View className='min-w-full'>
        {renderTableHeader()}

        {playersStats.length === 0 ? (
          <View className='items-center py-4'>
            <Text className='text-gray-500 text-base'>No data available</Text>
          </View>
        ) : (
          <ScrollView
            className='max-h-96'
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {playersStats.map((player, index) =>
              renderPlayerRow(player, index)
            )}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

export default PlayerStats;
