import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';

import LeagueCard from '../../components/LeagueCard';
import api from '../../lib/api';
import Toast from 'react-native-toast-message';
import useFetch from '../../hooks/useFetch';

const Leagues = () => {
  const [leagues, setLeagues] = useState([]);
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
    const getLeagues = async () => {
      try {
        const res = await api.get(`/api/admin/league`, {
          params: { season: selectedSeason },
        });
        if (res.status === 200) {
          setLeagues(res.data);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to fetch leagues',
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedSeason) {
      getLeagues();
    }
  }, [selectedSeason]);

  const seasonData = seasons.map((season) => ({
    key: season._id,
    value: season.name,
  }));

  if (isLoading || loading) {
    return (
      <View className={`flex-1 justify-center items-center`}>
        <ActivityIndicator size='large' color='#6366F1' />
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 bg-white`}>
      <Animated.View
        entering={FadeInDown.duration(500)}
        className={`bg-white rounded-lg mx-4 my-4 p-4 shadow-lg`}
      >
        <View className={`mb-4`}>
          <View className={`flex-row items-center mb-4`}>
            <Icon name='trophy' size={24} className={`text-yellow-500`} />
            <Text className={`text-2xl font-bold text-gray-800 ml-3`}>
              Leagues
            </Text>
          </View>

          <View className={`w-full`}>
            <SelectList
              setSelected={setSelectedSeason}
              data={seasonData}
              defaultOption={{
                key: selectedSeason,
                value: seasons.find((s) => s._id === selectedSeason)?.name,
              }}
              search={false}
              boxclassNames={`border border-gray-300 rounded-md bg-white p-2`}
              dropdownclassNames={`border border-gray-300 bg-white mt-1`}
              inputclassNames={`text-gray-700 text-base`}
            />
          </View>
        </View>

        <View className={`h-px bg-gray-200 my-4`} />

        <Animated.View entering={FadeIn.duration(500).delay(200)}>
          {leagues.length > 0 ? (
            <LeagueCard data={leagues} />
          ) : (
            <Text className='text-center text-gray-500 text-base py-6'>
              No leagues found for the selected season.
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

export default Leagues;
