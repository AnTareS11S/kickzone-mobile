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

const ParticipantsList = ({ participants, teamId, trainingId }) => {
  const [localParticipants, setLocalParticipants] = useState(
    participants || []
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: teamPlayers, isLoading: loading } = useFetch(
    `/api/team/${teamId}/players`
  );

  console.log('participants', participants);

  useEffect(() => {
    setLocalParticipants(participants);
  }, [participants]);

  const handleAddParticipant = async (playerId) => {
    try {
      const res = await api.post(
        `/api/admin/training/attendance/${trainingId}`,
        {
          playerId,
        }
      );

      if (res.status === 200) {
        setLocalParticipants([...localParticipants, playerId]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add participant');
    }
  };

  const handleRemoveParticipant = async (playerId) => {
    try {
      const res = await api.delete(
        `/api/training/${trainingId}/participants/${playerId}`
      );

      if (res.status === 200) {
        setLocalParticipants(localParticipants.filter((id) => id !== playerId));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove participant');
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
        players={participants?.filter(
          (player) => !localParticipants?.some((p) => p._id === player._id)
        )}
        onSelect={handleAddParticipant}
      />
    </View>
  );
};

export default ParticipantsList;
