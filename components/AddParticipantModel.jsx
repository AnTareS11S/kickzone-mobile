import React from 'react';
import { View, Text, Pressable, FlatList, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AddParticipantModal = ({ visible, onClose, players, onSelect }) => {
  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <View className='flex-1 justify-end bg-black/50'>
        <View className='bg-white rounded-t-3xl p-6 max-h-[70vh]'>
          <View className='flex-row justify-between items-center mb-4'>
            <Text className='text-xl font-bold'>Select Player</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name='close' size={24} color='gray' />
            </Pressable>
          </View>

          <FlatList
            data={players}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item._id);
                  onClose();
                }}
                className='p-3 flex-row items-center border-b border-gray-100'
              >
                <Text className='text-base flex-1'>
                  {item.name} {item.surname}
                </Text>
                <MaterialIcons name='person-add' size={20} color='#6B46C1' />
              </Pressable>
            )}
            ListEmptyComponent={
              <View className='items-center p-4'>
                <Text className='text-gray-500'>
                  All team members are already added
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default AddParticipantModal;
