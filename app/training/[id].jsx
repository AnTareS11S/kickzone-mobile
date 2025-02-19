import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Switch,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import ParticipantsList from '../../components/ParticipantsList';
import useFetch from '../../hooks/useFetch';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../lib/api';
import CustomButton from '../../components/CustomButton';
import { useSelector } from 'react-redux';

const TrainingDetails = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const { id: trainingId } = useLocalSearchParams();
  const router = useRouter();
  const [training, setTraining] = useState(null);
  const [attendance, setAttendance] = useState(false);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useSelector((state) => state.user);
  const { data: player } = useFetch(`/api/player/get/${currentUser?._id}`);
  const { data: coach } = useFetch(`/api/coach/get/${currentUser?.id}`);
  const { data: participants } = useFetch(
    `/api/admin/team-player/${coach?.currentTeam}`
  );

  const fetchTraining = useCallback(async () => {
    try {
      const res = await api.get(`/api/admin/training/get/${trainingId}`);
      const data = await res.data;
      setTraining(data);
      setAttendance(data.participants?.includes(player?._id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [trainingId, player?._id]);

  useEffect(() => {
    fetchTraining();
  }, [fetchTraining]);

  const handleAttendance = async () => {
    try {
      const res = await api.post(
        `/api/admin/training/attendance/${trainingId}`,
        {
          playerId: player?._id,
          attendance: !attendance,
        }
      );

      if (res.status === 200) {
        setAttendance(!attendance);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 bg-gray-50'>
      <View className='p-4'>
        {/* Header */}
        <View className='flex-row justify-between items-center mb-6'>
          <View className='flex-row items-center space-x-2'>
            <MaterialCommunityIcons
              name='clock-outline'
              size={18}
              color='gray'
            />
            <Text className='text-gray-500'>
              {new Date(training?.trainingDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Main Card */}
        <LinearGradient
          colors={['#4F46E5', '#7952B3']}
          className='rounded-2xl shadow-lg mb-6'
        >
          <View className='p-6'>
            <View className='flex-row justify-between items-start mb-4'>
              <Text className='text-2xl font-bold text-white'>
                {training.name}
              </Text>
              {training.isActive && (
                <View className='bg-green-500 px-3 py-1 rounded-full'>
                  <Text className='text-white text-xs'>Active</Text>
                </View>
              )}
            </View>

            <View className={`flex-row flex-wrap gap-4 mb-6`}>
              <DetailItem
                icon='clock-outline'
                value={`${training.duration} mins`}
              />
              <DetailItem icon='map-marker-outline' value={training.location} />
              <DetailItem
                icon='information-outline'
                value={training.trainingType?.name}
              />
            </View>

            {training.isActive && currentUser?.role === 'Player' && (
              <View className='bg-white/10 p-4 rounded-xl'>
                <View className='flex-row items-center justify-between mb-3'>
                  <Text className='text-white text-base'>Mark Attendance</Text>
                  <Switch
                    value={attendance}
                    onValueChange={handleAttendance}
                    trackColor={{ true: '#34D399', false: '#D1D5DB' }}
                  />
                </View>
                <CustomButton
                  title='Submit Attendance'
                  handlePress={handleAttendance}
                  containerStyles='w-full'
                  variant='primary'
                />
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Info Cards */}
        <View className={`gap-4 ${isSmallScreen ? 'flex-col' : 'flex-row'}`}>
          {['typeDescription', 'notes', 'equipment'].map(
            (item) =>
              training[item] && (
                <InfoCard
                  key={item}
                  title={
                    item === 'typeDescription'
                      ? 'Description'
                      : item === 'notes'
                      ? 'Coach Notes'
                      : 'Equipment'
                  }
                  content={training[item]}
                  icon={
                    item === 'typeDescription'
                      ? 'text-subject'
                      : item === 'notes'
                      ? 'note-text-outline'
                      : 'tshirt-crew-outline'
                  }
                />
              )
          )}
        </View>

        {/* Participants List */}
        {/* {coach && currentUser?.role === 'Coach' && (
          <View className='mt-8'>
            <Text className='text-2xl font-bold text-gray-800 mb-4 text-center'>
              Training Participants
            </Text>
            <ParticipantsList
              participants={participants}
              teamId={coach?.currentTeam}
            />
          </View>
        )} */}
      </View>
    </ScrollView>
  );
};

const DetailItem = ({ icon, value }) => (
  <View className='flex-row items-center space-x-2'>
    <MaterialCommunityIcons name={icon} size={20} color='white' />
    <Text className='text-white text-base'>{value}</Text>
  </View>
);

const InfoCard = ({ title, content, icon }) => {
  return (
    <View className='flex-1 bg-white p-4 rounded-xl shadow-sm'>
      <View className='flex-row items-center space-x-2 mb-3'>
        <MaterialCommunityIcons name={icon} size={20} color='gray' />
        <Text className='text-lg font-semibold text-gray-800'>{title}</Text>
      </View>
      <Text className='text-gray-600'>{content}</Text>
    </View>
  );
};

export default TrainingDetails;
