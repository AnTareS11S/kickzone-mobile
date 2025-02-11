import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import useFetch from '../hooks/useFetch';
import { useLocalSearchParams } from 'expo-router';
import api from '../lib/api';
import { SelectList } from 'react-native-dropdown-select-list';

const fetchData = async (url, setter, setLoading) => {
  try {
    const res = await api.get(url);
    const data = await res.data;

    if (!res.status === 200) {
      throw new Error(data.message);
    }

    setter(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

const TeamStats = () => {
  const { id: teamId } = useLocalSearchParams();
  const [stats, setStats] = useState({
    redCards: [],
    yellowCards: [],
    goalsScored: [],
    goalsLost: [],
    wins: null,
    draws: null,
    losses: null,
  });
  const { data: seasons, isLoading } = useFetch('/api/admin/season');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch initial season
  useEffect(() => {
    if (seasons.length > 0) {
      const lastSeason = seasons[seasons.length - 1]._id;
      setSelectedSeason(lastSeason);
    }
  }, [seasons]);

  // Fetch team stats when season or teamId changes
  useEffect(() => {
    if (selectedSeason) {
      setLoading(true);

      fetchData(
        `/api/team/team-cards/${teamId}?season=${selectedSeason}`,
        (data) => {
          setStats((prev) => ({
            ...prev,
            redCards: data.redCards,
            yellowCards: data.yellowCards,
          }));
        },
        setLoading
      );

      fetchData(
        `/api/team/team-goals/${teamId}?season=${selectedSeason}`,
        (data) => {
          setStats((prev) => ({
            ...prev,
            goalsScored: data.goalsScored,
            goalsLost: data.goalsLost,
          }));
        },
        setLoading
      );

      fetchData(
        `/api/team/team-outcomes/${teamId}?season=${selectedSeason}`,
        (data) => {
          setStats((prev) => ({
            ...prev,
            wins: data.wins,
            draws: data.draws,
            losses: data.losses,
          }));
        },
        setLoading
      );
    }
  }, [teamId, selectedSeason]);

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <ScrollView className='px-4 py-6 bg-gray-50'>
      <View className='bg-white rounded-lg shadow-lg p-6'>
        <View className='mb-6'>
          <SelectList
            setSelected={setSelectedSeason}
            data={seasons.map((season) => ({
              key: season._id,
              value: season.name,
            }))}
            placeholder='Select Season'
            boxStyles='border border-gray-300 rounded-lg mb-4'
            dropdownStyles='bg-white shadow-lg'
            search={false}
          />
        </View>

        <Text className='text-xl font-semibold text-gray-700 mb-4'>
          Statistics Overview
        </Text>

        <View className='flex flex-col mb-8 '>
          <StatCard
            title='Wins'
            value={stats.wins || 0}
            icon={<Icon name='trophy' size={30} color='green' />}
            color='green-500'
          />
          <StatCard
            title='Draws'
            value={stats.draws || 0}
            icon={<Icon name='handshake-o' size={30} color='blue' />}
            color='blue-500'
          />
          <StatCard
            title='Losses'
            value={stats.losses || 0}
            icon={<Icon name='frown-o' size={30} color='gray' />}
            color='gray-500'
          />
        </View>

        <View className='flex flex-row flex-wrap justify-between'>
          <DetailCard
            title='Goals Scored'
            items={stats.goalsScored}
            icon={<Icon name='soccer-ball-o' size={24} color='green' />}
          />
          <DetailCard
            title='Goals Lost'
            items={stats.goalsLost}
            icon={<Icon name='soccer-ball-o' size={24} color='red' />}
          />
          <DetailCard
            title='Yellow Cards'
            items={stats.yellowCards}
            icon={<Icon name='square' size={24} color='yellow' />}
          />
          <DetailCard
            title='Red Cards'
            items={stats.redCards}
            icon={<Icon name='square' size={24} color='red' />}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <View className={`bg-${color}-100 p-6 rounded-lg gap-3 shadow-lg flex-1`}>
    <View className='flex flex-row items-center mb-4'>
      {icon}
      <Text className='text-lg font-semibold text-gray-800 ml-2'>{title}</Text>
    </View>
    <Text className={`text-4xl font-bold text-${color}`}>{value}</Text>
  </View>
);

const DetailCard = ({ title, items, icon }) => (
  <View className='w-1/2 mb-6'>
    <Text className='text-xl font-semibold text-gray-800 mb-4'>{title}</Text>
    {items.map((item, index) => (
      <View key={index} className='flex flex-row items-center mb-4'>
        {icon}
        <Text className='text-gray-700 ml-2'>{item?.count}</Text>
      </View>
    ))}
  </View>
);

export default TeamStats;
