import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ActiveTrainings = ({
  trainings,
  isArchived = false,
  currentUser,
  currentTeamId,
  playerId,
  isSmallScreen,
}) => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  const handleMarkAsRead = (trainingId) => {
    if (currentUser?.role === 'Player') {
      emit('markTeamTrainingNotificationRead', {
        teamId: currentTeamId,
        userId: playerId,
        trainingId,
      });
    }
  };

  const renderTrainingStatus = () => (
    <View
      className={`${
        isArchived ? 'bg-blue-100' : 'bg-green-100'
      } px-2 py-1 rounded-full`}
    >
      <Text
        className={`${
          isArchived ? 'text-blue-800' : 'text-green-800'
        } text-xs font-medium`}
      >
        {isArchived ? 'Completed' : 'Upcoming'}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View className='py-8 items-center space-y-4'>
      {isArchived ? (
        <MaterialIcons
          name='emoji-events'
          size={isSmallScreen ? 48 : 64}
          color='#6B7280'
        />
      ) : (
        <FontAwesome
          name='play-circle'
          size={isSmallScreen ? 48 : 64}
          color='#6B7280'
        />
      )}
      <Text className='text-lg text-gray-500'>
        No {isArchived ? 'completed' : 'active'} trainings
      </Text>
      <Text className='text-sm text-gray-400 text-center px-4'>
        {isArchived
          ? 'Completed trainings will appear here'
          : 'Check back later for scheduled trainings'}
      </Text>
    </View>
  );

  return (
    <View className='w-full bg-white rounded-xl shadow-sm mt-4'>
      <View className='p-4 border-b border-gray-200 flex-row justify-between items-center'>
        <View className='flex-row items-center space-x-3'>
          {isArchived ? (
            <MaterialIcons name='emoji-events' size={24} color='#6B7280' />
          ) : (
            <FontAwesome name='play-circle' size={24} color='#6B7280' />
          )}
          <Text className='text-xl font-bold text-gray-800'>
            {isArchived ? 'Completed' : 'Upcoming'} Trainings
          </Text>
        </View>
        {trainings?.length > 0 && (
          <Text className='text-sm text-gray-500'>
            {trainings.length} {isArchived ? 'Completed' : 'Upcoming'}
          </Text>
        )}
      </View>

      <View className='p-4'>
        {trainings?.length > 0 ? (
          <View className='space-y-4'>
            {trainings.map((training) => (
              <Pressable
                key={training._id}
                onPress={() => {
                  handleMarkAsRead(training._id);
                  router.push(`/training/${training._id}`);
                }}
                className={`p-4 bg-gray-50 rounded-lg ${
                  width < 375 ? 'flex-col' : 'flex-row justify-between'
                }`}
              >
                {currentUser?.role === 'Player' && training.isNew && (
                  <Animated.View
                    style={{ opacity: fadeAnim }}
                    className='absolute -top-2 -right-2 z-10'
                  >
                    <View className='bg-gray-600 px-2 py-1 rounded-full flex-row items-center'>
                      <FontAwesome
                        name='star'
                        size={12}
                        color='white'
                        style={{ marginRight: 4 }}
                      />
                      <Text className='text-white text-xs font-bold'>New</Text>
                    </View>
                  </Animated.View>
                )}

                <View className={`flex-1 ${width >= 375 && 'pr-4'}`}>
                  <View className='flex-row items-center space-x-2 mb-2'>
                    <Text className='text-base font-semibold text-gray-900'>
                      {training.name}
                    </Text>
                    {renderTrainingStatus()}
                  </View>
                </View>

                <View className={`${width >= 375 ? 'items-end' : 'mt-3'}`}>
                  <View className='flex-row items-center space-x-2'>
                    <FontAwesome name='calendar' size={14} color='#6B7280' />
                    <Text className='text-sm text-gray-500'>
                      {new Date(training.trainingDate).toLocaleDateString(
                        'en-GB'
                      )}
                    </Text>
                  </View>
                  <View className='flex-row items-center space-x-2 mt-1'>
                    <FontAwesome name='clock-o' size={14} color='#6B7280' />
                    <Text className='text-sm text-gray-500'>
                      {new Date(training.trainingDate).toLocaleTimeString(
                        'en-GB',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

export default ActiveTrainings;
