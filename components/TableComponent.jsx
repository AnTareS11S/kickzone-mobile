import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Card } from '@rneui/themed';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import useFetch from '../hooks/useFetch';
import api from '../lib/api';
import { useRouter } from 'expo-router';

const TableComponent = ({ leagueId }) => {
  const { data: teamStats } = useFetch(`/api/league/teams-stats/${leagueId}`);
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();

  const handleDownloadXLSX = async () => {
    try {
      const response = await api.get(`/api/team/download-xlsx/${leagueId}`, {
        responseType: 'base64',
      });

      const blob = await response.data;

      const fileUri = FileSystem.documentDirectory + 'LeagueStandings.xlsx';

      await FileSystem.writeAsStringAsync(fileUri, blob, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to download standings');
    }
  };

  const renderTableHeader = () => (
    <View className='flex-row bg-gray-100 py-3 border-b border-gray-200'>
      <Text className='w-8 text-center font-semibold text-sm'>#</Text>
      <Text className='flex-1 font-semibold text-sm pl-2'>Team</Text>
      <Text className='w-10 text-center font-semibold text-sm'>P</Text>
      <Text className='w-10 text-center font-semibold text-sm'>Pts</Text>
      <Text className='w-12 text-center font-semibold text-sm'>GD</Text>
    </View>
  );

  const renderTeamRow = (team, index) => (
    <TouchableOpacity
      key={team.team}
      onPress={() => router.push(`/team/${team.team}`)}
      className='flex-row items-center py-3 border-b border-gray-100'
    >
      <Text className='w-8 text-center text-sm'>{index + 1}</Text>
      <View className='flex-1 flex-row items-center pl-2'>
        <Image
          source={{
            uri:
              team.logoUrl ||
              'https://d3awt09vrts30h.cloudfront.net/team_img_default.png',
          }}
          className='h-6 w-6 rounded-full'
          resizeMode='contain'
        />
        <Text className='text-sm ml-2 flex-1' numberOfLines={1}>
          {team.name}
        </Text>
      </View>
      <Text className='w-10 text-center text-sm'>{team.gamesPlayed}</Text>
      <Text className='w-10 text-center text-sm font-semibold'>
        {team.points}
      </Text>
      <Text className='w-12 text-center text-sm'>{team.goalDifference}</Text>
    </TouchableOpacity>
  );

  return (
    <View className='p-4'>
      <TouchableOpacity
        onPress={handleDownloadXLSX}
        className='bg-purple-500 rounded-lg py-2 px-4 mb-4 self-end'
      >
        <Text className='text-white font-semibold'>Download Standings</Text>
      </TouchableOpacity>

      <Card
        containerStyle={{
          borderRadius: 8,
          padding: 0,
          margin: 0,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className='min-w-full'>
            {renderTableHeader()}
            <ScrollView
              style={{ height: screenHeight * 0.7 }}
              showsVerticalScrollIndicator={false}
            >
              {teamStats.map((team, index) => renderTeamRow(team, index))}
            </ScrollView>
          </View>
        </ScrollView>
      </Card>
    </View>
  );
};

export default TableComponent;
