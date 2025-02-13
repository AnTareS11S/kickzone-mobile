import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../../lib/api';
import { useLocalSearchParams, useRouter } from 'expo-router';

const ResultDetails = () => {
  const { id: resultId } = useLocalSearchParams();
  const router = useRouter();
  const [result, setResult] = useState({});
  const [match, setMatch] = useState({});
  const [homeTeamPlayersStats, setHomeTeamPlayersStats] = useState([]);
  const [awayTeamPlayersStats, setAwayTeamPlayersStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getResult = async () => {
      try {
        const res = await api.get(`/api/referee/result-details/${resultId}`);
        const data = await res.data;

        const filterPlayersWithStats = (playersStats) => {
          return playersStats.filter((player) =>
            player.matchStats.some(
              (stat) =>
                stat.goals > 0 ||
                stat.yellowCards > 0 ||
                stat.redCards > 0 ||
                stat.ownGoals > 0 ||
                stat.cleanSheets > 0
            )
          );
        };

        setResult(data?.result);
        setMatch(data?.match);
        setHomeTeamPlayersStats(
          filterPlayersWithStats(data?.filteredHomeTeamPlayersStats)
        );
        setAwayTeamPlayersStats(
          filterPlayersWithStats(data?.filteredAwayTeamPlayersStats)
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getResult();
  }, [resultId]);

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' color='#4263EB' />
      </View>
    );
  }

  const navigateToReferee = (refereeId) => {
    router.push(`/referee/${refereeId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='px-4 py-6'>
        {/* Main Content */}
        <View className='bg-white rounded-lg shadow-lg overflow-hidden'>
          <View className='px-4 py-6'>
            {/* Teams and Score */}
            <View className='mb-6'>
              {/* Home Team */}
              <View className='flex-row items-center justify-between mb-4'>
                <View className='flex-row items-center space-x-3'>
                  {match?.homeTeam?.logoUrl && (
                    <Image
                      source={{ uri: match.homeTeam.logoUrl }}
                      className='w-12 h-12 rounded-full'
                      resizeMode='cover'
                    />
                  )}
                  <Text className='text-lg font-semibold text-gray-800'>
                    {match?.homeTeam?.name}
                  </Text>
                </View>
                <Text className='text-2xl font-bold text-gray-800'>
                  {result?.homeTeamScore}
                </Text>
              </View>

              {/* Away Team */}
              <View className='flex-row items-center justify-between'>
                <View className='flex-row items-center space-x-3'>
                  {match?.awayTeam?.logoUrl && (
                    <Image
                      source={{ uri: match.awayTeam.logoUrl }}
                      className='w-12 h-12 rounded-full'
                      resizeMode='cover'
                    />
                  )}
                  <Text className='text-lg font-semibold text-gray-800'>
                    {match?.awayTeam?.name}
                  </Text>
                </View>
                <Text className='text-2xl font-bold text-gray-800'>
                  {result?.awayTeamScore}
                </Text>
              </View>
            </View>

            {/* Date and Time */}
            <Text className='text-gray-600 text-center text-base mb-6'>
              {formatDate(match?.startDate)}
            </Text>

            {/* Match Officials */}
            <View className='bg-gray-50 p-4 rounded-lg mb-6'>
              <Text className='text-lg font-semibold text-gray-800 mb-3'>
                Match Officials
              </Text>

              {/* Main Referee */}
              <View className='mb-2'>
                <Text className='font-medium text-gray-700'>Main Referee:</Text>
                <TouchableOpacity
                  onPress={() => navigateToReferee(match?.mainReferee?._id)}
                >
                  <Text className='text-blue-500'>
                    {match?.mainReferee?.name} {match?.mainReferee?.surname}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* First Assistant */}
              <View className='mb-2'>
                <Text className='font-medium text-gray-700'>
                  1st Assistant:
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigateToReferee(match?.firstAssistantReferee?._id)
                  }
                >
                  <Text className='text-blue-500'>
                    {match?.firstAssistantReferee?.name}{' '}
                    {match?.firstAssistantReferee?.surname}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Second Assistant */}
              <View>
                <Text className='font-medium text-gray-700'>
                  2nd Assistant:
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigateToReferee(match?.secondAssistantReferee?._id)
                  }
                >
                  <Text className='text-blue-500'>
                    {match?.secondAssistantReferee?.name}{' '}
                    {match?.secondAssistantReferee?.surname}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Team Stats */}
            <View className='space-y-6'>
              {/* Home Team Players */}
              <View>
                <Text className='text-lg font-semibold text-gray-800 mb-3'>
                  Home Team Players
                </Text>
                {homeTeamPlayersStats.map((player) => (
                  <View key={player._id} className='flex-row items-center mb-2'>
                    <View className='flex-row mr-2 '>
                      {player?.matchStats.map((stat, index) => (
                        <View key={index} className='flex-row gap-3'>
                          {[...Array(stat.goals)].map((_, i) => (
                            <Icon
                              key={`goal-${i}`}
                              name='soccer-ball-o'
                              size={24}
                              color='green'
                            />
                          ))}
                          {[...Array(stat.yellowCards)].map((_, i) => (
                            <Icon
                              key={`yellow-${i}`}
                              name='square'
                              size={24}
                              color='yellow'
                            />
                          ))}
                          {[...Array(stat.redCards)].map((_, i) => (
                            <Icon
                              key={`red-${i}`}
                              name='square'
                              size={24}
                              color='red'
                            />
                          ))}
                        </View>
                      ))}
                    </View>
                    <Text className='text-gray-800'>
                      {player?.player?.name} {player?.player?.surname}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Away Team Players */}
              <View>
                <Text className='text-lg font-semibold text-gray-800 mb-3'>
                  Away Team Players
                </Text>
                {awayTeamPlayersStats.map((player) => (
                  <View key={player._id} className='flex-row items-center mb-2'>
                    <View className='flex-row mr-2'>
                      {player?.matchStats.map((stat, index) => (
                        <View key={index} className='flex-row gap-3'>
                          {[...Array(stat.goals)].map((_, i) => (
                            <Icon
                              key={`goal-${i}`}
                              name='soccer-ball-o'
                              size={24}
                              color='green'
                            />
                          ))}
                          {[...Array(stat.yellowCards)].map((_, i) => (
                            <Icon
                              key={`yellow-${i}`}
                              name='square'
                              size={24}
                              color='yellow'
                            />
                          ))}
                          {[...Array(stat.redCards)].map((_, i) => (
                            <Icon
                              key={`red-${i}`}
                              name='square'
                              size={24}
                              color='red'
                            />
                          ))}
                        </View>
                      ))}
                    </View>
                    <Text className='text-gray-800'>
                      {player?.player?.name} {player?.player?.surname}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ResultDetails;
