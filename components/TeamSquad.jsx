import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useFetch from '../hooks/useFetch';

const TeamSquad = () => {
  const { id: teamId } = useLocalSearchParams();
  const router = useRouter();
  const { data: playersData, isLoading: loading } = useFetch(
    `/api/admin/team-player/${teamId}`
  );

  const playerPositions = {
    Goalkeepers: ['Goalkeeper'],
    Defenders: ['Center back', 'Left outside back', 'Right outside back'],
    Midfielders: [
      'Defensive midfielder',
      'Center midfielder',
      'Left midfielder',
      'Right midfielder',
    ],
    Forwards: ['Striker', 'Left winger', 'Right winger'],
  };

  const renderPlayerList = (position) => {
    const filteredPlayers = playersData?.filter((player) =>
      playerPositions[position].includes(player.position)
    );

    return (
      <View key={position} className='mb-8'>
        <Text className='text-3xl font-semibold mb-5 text-purple-800'>
          {position}
        </Text>

        <View className='flex-wrap gap-6'>
          {filteredPlayers.map((player) => (
            <TouchableOpacity
              key={player._id}
              onPress={() => router.push(`/player/${player._id}`)}
              className='bg-white rounded-xl shadow-lg p-6 w-full'
            >
              <Image
                source={{
                  uri:
                    player?.imageUrl ||
                    'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
                }}
                className='w-24 h-24 rounded-full border-4 border-purple-500 mx-auto mb-4'
              />
              <Text className='font-semibold text-lg text-center'>
                {player.name}
              </Text>
              <Text className='text-center text-gray-600'>
                {player.surname}
              </Text>
              <Text className='text-center text-gray-600'>
                {player.age} years old
              </Text>
              <Text className='text-center text-gray-600'>
                {player.position}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 bg-gray-50 px-4 py-6'>
      {playersData?.length ? (
        Object.keys(playerPositions).map((position) =>
          renderPlayerList(position)
        )
      ) : (
        <View className='flex-1 justify-center items-center text-gray-600'>
          <Text className='text-gray-600'>No players found</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default TeamSquad;
