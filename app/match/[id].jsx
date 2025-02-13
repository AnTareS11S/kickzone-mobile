import React from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useLocalSearchParams } from 'expo-router';
import useFetch from '../../hooks/useFetch';

const MatchDetails = () => {
  const { id: matchId } = useLocalSearchParams();
  const { data: match, isLoading: loading } = useFetch(
    `/api/match/overview/${matchId}`
  );

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-100'>
        <ActivityIndicator size='large' color='#4263EB' />
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='px-4 py-6'>
        {/* Match Card */}
        <View className='bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden'>
          {/* Header */}
          <View className='bg-gradient-to-r from-blue-600 to-indigo-600 p-5'>
            <View className='flex-row justify-between items-center'>
              <Text className='text-lg font-semibold text-white'>
                {match?.league}
              </Text>
              <View className='bg-white/20 px-3 py-1 rounded-lg'>
                <Text className='text-xs font-medium text-white'>
                  {match?.season}
                </Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View className='p-6'>
            {/* Teams */}
            <View className='flex-row justify-between items-center mb-6'>
              <TeamDisplay team={match?.homeTeam} isHome={true} />
              <View className='bg-gray-200 px-4 py-2 rounded-lg'>
                <Text className='text-lg font-bold text-gray-800'>VS</Text>
              </View>
              <TeamDisplay team={match?.awayTeam} isHome={false} />
            </View>

            {/* Match Details */}
            <View className='space-y-5'>
              <InfoItem
                iconName='clock-o'
                label='Date & Time'
                value={formatDate(match?.startDate)}
              />
              <InfoItem
                iconName='map-marker'
                label='Venue'
                value={match.homeTeam?.stadium?.name ?? 'Not available'}
              />
              <InfoItem
                iconName='user'
                label='Referee'
                value={match?.mainReferee ?? 'Not assigned'}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const TeamDisplay = ({ team, isHome }) => (
  <View className={`items-center flex-1 ${isHome ? 'mr-3' : 'ml-3'}`}>
    <Image
      source={{ uri: team?.logoUrl }}
      className='w-20 h-20 mb-2'
      resizeMode='contain'
    />
    <Text className='text-lg font-semibold text-gray-800 text-center'>
      {team?.name}
    </Text>
  </View>
);

const InfoItem = ({ iconName, label, value }) => (
  <View className='flex-row items-center space-x-3 bg-gray-50 p-3 rounded-lg shadow-sm'>
    <Icon name={iconName} size={20} color='#4263EB' />
    <View>
      <Text className='text-sm text-gray-500'>{label}</Text>
      <Text className='font-medium text-gray-800'>{value}</Text>
    </View>
  </View>
);

export default MatchDetails;
