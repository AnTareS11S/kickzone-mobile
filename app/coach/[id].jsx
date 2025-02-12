import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import useFetch from '../../hooks/useFetch';

const StatCard = ({ title, value, Icon }) => (
  <View className='bg-white rounded-lg p-4 shadow-md flex-row items-center space-x-4'>
    <View className='p-3 bg-blue-50 rounded-full'>{Icon}</View>
    <View>
      <Text className='text-sm text-gray-500'>{title}</Text>
      <Text className='text-2xl font-bold text-gray-800'>{value}</Text>
    </View>
  </View>
);

const CoachDetails = () => {
  const { id: coachId } = useLocalSearchParams();
  const { data: coach, isLoading } = useFetch(`/api/coach/${coachId}`);
  const { data: stats } = useFetch(
    `/api/coach/coach-stats/${coachId}/${coach.currentTeamId}`
  );

  if (isLoading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <ScrollView className='px-4 py-6 bg-gray-50'>
      {/* Profile Section */}
      <View className='bg-white shadow-lg rounded-lg p-6 mb-6'>
        <View className='flex flex-col items-center'>
          <Image
            source={{
              uri:
                coach?.imageUrl ||
                'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
            }}
            className='w-32 h-32 rounded-full border-4 border-white mb-4'
          />
          <Text className='text-2xl font-bold text-gray-800'>
            {coach?.name} {coach?.surname}
          </Text>
          <Text className='text-gray-600'>
            {coach?.bio} | {coach?.currentTeam}
          </Text>
        </View>
      </View>

      {/* Stats Section */}
      {stats && (
        <View className='bg-white shadow-lg rounded-lg p-6 mb-6'>
          <Text className='text-lg font-semibold mb-4 text-gray-800'>
            Current Team Statistics
          </Text>
          <View className='flex flex-row flex-wrap justify-between'>
            <StatCard
              title='Total Matches'
              value={stats.matches}
              Icon={<Icon name='futbol-o' size={30} color='black' />}
            />
            <StatCard
              title='Wins'
              value={stats.wins}
              Icon={<Icon name='trophy' size={30} color='green' />}
            />
            <StatCard
              title='Draws'
              value={stats.draws}
              Icon={<Icon name='handshake-o' size={30} color='gray' />}
            />
            <StatCard
              title='Losses'
              value={stats.losses}
              Icon={<Icon name='frown-o' size={30} color='red' />}
            />
          </View>

          <View className='mt-4 bg-blue-50 p-4 rounded-lg'>
            <Text className='text-blue-800 text-sm'>
              Win Rate:{' '}
              {stats.matches
                ? ((stats.wins / stats.matches) * 100).toFixed(1)
                : 0}
              %
            </Text>
          </View>
        </View>
      )}

      {/* Personal Info & Previous Teams */}
      <View className='bg-white shadow-lg rounded-lg p-6'>
        <Text className='text-lg font-semibold mb-4 text-gray-800'>
          Personal Information
        </Text>
        <View className='space-y-3'>
          <View className='flex flex-row items-center'>
            <IconFA
              name='birthday-cake'
              className='text-gray-500 mr-3 w-5 h-5'
            />

            <Text className='text-gray-700 ml-4'>
              {coach?.birthDate?.toString().slice(0, 10)}
            </Text>
          </View>
          <View className='flex flex-row items-center'>
            <IconFA name='flag' className='text-gray-500 mr-3 w-5 h-5' />
            <Text className='text-gray-700 ml-4'>{coach?.nationality}</Text>
          </View>
          <View className='flex flex-row items-center'>
            <IconFA
              name='map-marker-alt'
              className='text-gray-500 mr-3 w-5 h-5'
            />
            <Text className='text-gray-700 ml-4'>{coach?.city}</Text>
          </View>
        </View>
      </View>

      {/* Previous Teams */}
      <View className='bg-white shadow-lg rounded-lg p-6 my-6'>
        <Text className='text-lg font-semibold mb-4 text-gray-800'>
          Previous Teams
        </Text>
        {coach?.teams?.length ? (
          <View className='space-y-2'>
            {coach.teams.map((team, index) => (
              <View key={index} className='flex flex-row items-center'>
                <View className='w-2 h-2 bg-blue-500 rounded-full mr-3' />
                <Text className='text-gray-700'>{team.split(':')[0]}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className='text-gray-500'>No previous teams available</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default CoachDetails;
