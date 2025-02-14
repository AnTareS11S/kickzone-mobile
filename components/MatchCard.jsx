import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MatchCard = ({ match, isPlayed }) => {
  const router = useRouter();

  const handlePress = () => {
    if (isPlayed) {
      router.push(`/result/${match?.resultId}`);
    } else {
      router.push(`/match/${match?.matchId}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className='mb-4 bg-white rounded-lg shadow-sm'
      style={{
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      activeOpacity={0.7}
    >
      <View className='p-4'>
        <View className='flex-row justify-between items-center mb-2'>
          <Text className='text-sm text-gray-500'>{match.league}</Text>
          <View className='flex-row items-center'>
            <Feather name='clock' size={14} color='#3B82F6' className='mr-1' />
            <Text className='text-sm font-semibold'>
              {new Date(match?.startDate).toLocaleTimeString('en-UK', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: false,
              })}
            </Text>
          </View>
        </View>

        <View className='flex-row justify-between items-center'>
          <Text className='font-semibold flex-1 text-left'>
            {match.homeTeam}
          </Text>
          <Text className='text-lg font-bold mx-2'>
            {isPlayed ? `${match?.homeScore} : ${match?.awayScore}` : 'vs'}
          </Text>
          <Text className='font-semibold flex-1 text-right'>
            {match.awayTeam}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MatchCard;
