import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import TeamCard from '../../components/TeamCard';
import TableComponent from '../../components/TableComponent';
import useFetch from '../../hooks/useFetch';
import PlayerStats from '../../components/PlayerStats';

const TopTab = createMaterialTopTabNavigator();

const LeaguePage = () => {
  const route = useRoute();
  const leagueId = route.params?.id;
  const { data: teams, isLoading: loading } = useFetch(
    `/api/league/teams/${leagueId}`
  );

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  const TeamsScreen = () => <TeamCard data={teams} loading={loading} />;
  const StandingsScreen = () => <TableComponent leagueId={leagueId} />;
  const TopScorersScreen = () => (
    <PlayerStats leagueId={leagueId} type='goals' />
  );
  const TopAssistsScreen = () => (
    <PlayerStats leagueId={leagueId} type='assists' />
  );
  const YellowCardsScreen = () => (
    <PlayerStats leagueId={leagueId} type='yellowCards' />
  );
  const RedCardsScreen = () => (
    <PlayerStats leagueId={leagueId} type='redCards' />
  );
  const CleanSheetsScreen = () => (
    <PlayerStats leagueId={leagueId} type='cleanSheets' />
  );

  return (
    <View className='flex-1 bg-white'>
      <View className='h-px bg-gray-200 w-full' />

      <TopTab.Navigator
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarStyle: { elevation: 0, shadowOpacity: 0 },
          tabBarItemStyle: { width: 'auto', paddingHorizontal: 10 },
          tabBarLabelStyle: { fontSize: 12, textTransform: 'none' },
          tabBarIndicatorStyle: { backgroundColor: 'black', height: 2 },
        }}
      >
        <TopTab.Screen
          name='Teams'
          component={TeamsScreen}
          options={{ tabBarLabel: 'Teams' }}
        />
        <TopTab.Screen
          name='Standings'
          component={StandingsScreen}
          options={{ tabBarLabel: 'Standings' }}
        />
        <TopTab.Screen
          name='TopScorers'
          component={TopScorersScreen}
          options={{ tabBarLabel: 'Top Scorers' }}
        />
        <TopTab.Screen
          name='TopAssists'
          component={TopAssistsScreen}
          options={{ tabBarLabel: 'Top Assists' }}
        />
        <TopTab.Screen
          name='YellowCards'
          component={YellowCardsScreen}
          options={{ tabBarLabel: 'Yellow Cards' }}
        />
        <TopTab.Screen
          name='RedCards'
          component={RedCardsScreen}
          options={{ tabBarLabel: 'Red Cards' }}
        />
        <TopTab.Screen
          name='CleanSheets'
          component={CleanSheetsScreen}
          options={{ tabBarLabel: 'Clean Sheets' }}
        />
      </TopTab.Navigator>
    </View>
  );
};

export default LeaguePage;
