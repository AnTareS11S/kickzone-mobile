import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import useFetch from '../hooks/useFetch';
import AddParticipantModal from './AddParticipantModel';
import CustomButton from './CustomButton';
import api from '../lib/api';
import Toast from 'react-native-toast-message';

const ParticipantsList = ({ participants, teamId, trainingId }) => {
  const [localParticipants, setLocalParticipants] = useState(
    participants || []
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: teamPlayers, isLoading: loading } = useFetch(
    `/api/admin/team-player/${teamId}`
  );

  useEffect(() => {
    const fetchParticipantsData = async () => {
      try {
        // Assuming your API returns full participant objects
        const res = await api.get(`/api/admin/participants/${trainingId}`);
        if (res.status === 200) {
          setLocalParticipants(res.data);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to fetch participants',
        });
      }
    };

    fetchParticipantsData();
  }, [trainingId, participants]);

  const handleAddParticipant = async (playerId) => {
    try {
      const res = await api.post(`/api/admin/participants/${trainingId}/add`, {
        player: playerId,
      });

      if (res.status === 200) {
        const newPlayer = teamPlayers.find((player) => player._id === playerId);
        if (newPlayer) {
          setLocalParticipants((prev) => [...prev, newPlayer]);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add participant',
      });
    }
  };

  const handleRemoveParticipant = async (playerId) => {
    try {
      const res = await api.delete(
        `/api/admin/participants/delete/${playerId}`
      );

      if (res.status === 200) {
        setLocalParticipants((prev) => prev.filter((p) => p._id !== playerId));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove participant',
      });
    }
  };

  const renderRightActions = (playerId) => (
    <Pressable
      onPress={() => handleRemoveParticipant(playerId)}
      className='bg-red-500 justify-center items-center w-20'
    >
      <MaterialIcons name='delete' size={24} color='white' />
    </Pressable>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item._id)}
      containerStyle={{ backgroundColor: 'transparent' }}
    >
      <View className='flex-row items-center p-4 bg-white mb-2 rounded-lg shadow-sm'>
        <View className='bg-gray-200 p-3 rounded-full mr-4'>
          <FontAwesome name='user' size={18} color='gray' />
        </View>
        <Text className='text-base flex-1'>
          {item.name} {item.surname}
        </Text>
        <MaterialIcons name='chevron-right' size={24} color='gray' />
      </View>
    </Swipeable>
  );

  return (
    <View className='flex-1'>
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-lg font-semibold'>
          Participants ({localParticipants?.length || 0})
        </Text>
        <CustomButton
          title='Add Participant'
          handlePress={() => setModalVisible(true)}
          containerStyles='py-2 px-4'
          variant='primary'
        />
      </View>

      {loading ? (
        <ActivityIndicator size='small' color='#6B46C1' />
      ) : localParticipants?.length === 0 ? (
        <View className='items-center justify-center p-8'>
          <MaterialIcons name='people-outline' size={48} color='gray' />
          <Text className='text-gray-500 mt-4'>No participants added yet</Text>
        </View>
      ) : (
        <FlatList
          data={localParticipants}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View className='h-2' />}
          ListFooterComponent={<View className='h-8' />}
        />
      )}

      <AddParticipantModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        players={teamPlayers?.filter(
          (player) => !localParticipants?.some((p) => p._id === player._id)
        )}
        onSelect={handleAddParticipant}
      />
    </View>
  );
};

export default ParticipantsList;
