import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../lib/api';
import { SelectList } from 'react-native-dropdown-select-list';
import useFetch from '../hooks/useFetch';

const TeamMatches = () => {
  const { id: teamId } = useLocalSearchParams();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: seasons, isLoading } = useFetch('/api/admin/season');
  const [selectedSeason, setSelectedSeason] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (seasons.length > 0) {
      const lastSeason = seasons[seasons.length - 1]._id;
      setSelectedSeason(lastSeason);
    }
  }, [seasons]);

  useEffect(() => {
    const getMatches = async () => {
      try {
        const res = await api.get(`/api/team/matches/${teamId}`, {
          params: { season: selectedSeason },
        });
        const data = await res.data;
        setMatches(data);
        setFilteredMatches(data.matches);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    getMatches();
  }, [teamId, selectedSeason]);

  const setOpponentsInMatches = () => {
    if (matches.matches && matches.teamOpponents) {
      matches.matches.forEach((match, index) => {
        match.opponent = matches.teamOpponents[index];
      });
    }
  };

  setOpponentsInMatches();

  if (loading || isLoading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 px-4 py-6'>
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

      {filteredMatches.length ? (
        <View className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {filteredMatches.map((match) => (
            <TouchableOpacity
              key={match?._id}
              onPress={() => router.push(`/match/${match?._id}`)}
              className='bg-white rounded-lg shadow-md p-4'
            >
              <Text className='text-xl font-semibold text-gray-800 mb-2'>
                {match.round.name}
              </Text>
              <Text className='text-gray-600 mb-2'>
                Date:{' '}
                {new Date(match.startDate).toLocaleString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Text>
              <Text className='text-gray-600 mb-2'>
                Opponent: {match.opponent.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text className='text-gray-600 text-center'>No matches found</Text>
      )}
    </ScrollView>
  );
};

export default TeamMatches;
