import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MatchCard from '../../components/MatchCard';
import useFetch from '../../hooks/useFetch';

const NoMatchesAlert = ({ title, description }) => (
  <View className='flex-row bg-gray-50 p-3 rounded-md border border-gray-200 mb-4'>
    <View className='mr-3 pt-0.5'>
      <Icon name='exclamation-circle' size={20} color='#F59E0B' />
    </View>
    <View className='flex-1'>
      <Text className='text-base font-semibold text-gray-900 mb-1'>
        {title}
      </Text>
      <Text className='text-sm text-gray-600'>{description}</Text>
    </View>
  </View>
);

const CardHeader = ({ colors, title, icon }) => (
  <LinearGradient
    colors={colors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    className='p-4 rounded-t-lg'
  >
    <View className='flex-row items-center'>
      <Text className='text-xl mr-2'>{icon}</Text>
      <Text className='text-xl font-bold text-white'>{title}</Text>
    </View>
  </LinearGradient>
);

const ExplorePage = () => {
  const { data: todaysMatches, isLoading: loading } = useFetch(
    '/api/admin/today-matches'
  );
  const { data: recentResults, isLoading } = useFetch(
    '/api/admin/recent-results'
  );

  if (loading || isLoading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#6D28D9' />
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView
        className='flex-1'
        contentContainerClassName='p-4'
        showsVerticalScrollIndicator={false}
      >
        <View className='space-y-4'>
          {/* Today's Matches Card */}
          <View className='bg-white rounded-lg shadow-md overflow-hidden'>
            <CardHeader
              colors={['#8B5CF6', '#7C3AED']}
              title="Today's Matches"
              icon='📅'
            />
            <View className='p-4'>
              {todaysMatches.length > 0 ? (
                todaysMatches.map((match) => (
                  <MatchCard
                    key={match?.matchId}
                    match={match}
                    isPlayed={false}
                  />
                ))
              ) : (
                <NoMatchesAlert
                  title='No Matches Today'
                  description='There are no scheduled matches for today. Check back later for updates!'
                />
              )}
            </View>
          </View>

          {/* Recent Results Card */}
          <View className='bg-white rounded-lg shadow-md overflow-hidden'>
            <CardHeader
              colors={['#10B981', '#059669']}
              title='Recent Results'
              icon='🏆'
            />
            <View className='p-4'>
              {recentResults.length > 0 ? (
                recentResults.map((match) => (
                  <MatchCard
                    key={match?.resultId}
                    match={match}
                    isPlayed={true}
                  />
                ))
              ) : (
                <NoMatchesAlert
                  title='No Recent Results'
                  description='There are no recent match results available at the moment.'
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExplorePage;
