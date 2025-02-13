import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../lib/api';
import useFetch from '../hooks/useFetch';
import { SelectList } from 'react-native-dropdown-select-list';

const TeamResult = () => {
  const { id: teamId } = useLocalSearchParams();
  const [results, setResults] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: seasons, isLoading } = useFetch('/api/admin/season');
  const [selectedSeason, setSelectedSeason] = useState('');

  useEffect(() => {
    if (seasons.length > 0) {
      const lastSeason = seasons[seasons.length - 1]._id;
      setSelectedSeason(lastSeason);
    }
  }, [seasons]);

  useEffect(() => {
    const fetchResultsData = async () => {
      try {
        const res = await api.get(`/api/team/results/${teamId}`, {
          params: { season: selectedSeason },
        });
        if (!res.status === 200) {
          throw new Error('Failed to fetch results data!');
        }
        const data = await res.data;

        setResults(data.results);
        setMatches(data.matches);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    if (selectedSeason) {
      fetchResultsData();
    }
  }, [teamId, selectedSeason]);

  const renderItem = (match) => {
    const matchResults = results.filter((result) => result.match === match._id);

    return matchResults.map((result) => (
      <TouchableOpacity
        key={result._id}
        onPress={() => router.push(`/result/${result._id}`)}
        className='bg-white mb-4 rounded-lg shadow-sm'
      >
        <View className='p-4 border border-gray-200 rounded-lg'>
          <View className='flex-row justify-between items-center'>
            <View className='flex-1'>
              <Text className='text-gray-800 font-semibold'>
                {match?.homeTeam?.name} {result?.homeTeamScore} :{' '}
                {result?.awayTeamScore} {match?.awayTeam?.name}
              </Text>
            </View>
            <View className='items-end'>
              <Text className='text-sm text-gray-500'>
                {new Date(match?.startDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
              <Text className='text-sm text-gray-500'>
                {new Date(match?.startDate).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  if (loading || isLoading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-50'>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Season Selection */}
        <View className='mb-4'>
          <SelectList
            setSelected={setSelectedSeason}
            data={seasons.map((season) => ({
              key: season._id,
              value: season.name,
            }))}
            placeholder='Select Season'
            boxStyles='border border-gray-300 rounded-lg'
            dropdownStyles='bg-white shadow-lg'
            search={false}
            onSelect={() => setLoading(true)}
          />
        </View>

        {/* Match Results */}
        {matches?.length > 0 ? (
          matches.map((match) => renderItem(match))
        ) : (
          <View className='flex-1 justify-center items-center'>
            <Text className='text-gray-600'>No results found.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TeamResult;
