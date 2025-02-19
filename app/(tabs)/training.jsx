import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFetch from '../../hooks/useFetch';
import { useSelector } from 'react-redux';
import ActiveTrainings from '../../components/ActiveTrainings';
import { useRefresh } from '../_layout';

const TrainingPage = () => {
  const { refreshKey, triggerGlobalRefresh } = useRefresh();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375; // iPhone SE size
  const isMediumScreen = width < 414; // iPhone 13 Pro Max size

  const { currentUser } = useSelector((state) => state.user);
  const { data: player, isLoading: playerLoading } = useFetch(
    `/api/player/get/${currentUser?._id}`
  );
  const { data: coach, isLoading: coachLoading } = useFetch(
    `/api/coach/get/${currentUser?._id}`
  );
  const { data: team } = useFetch(
    `/api/team/${player?.currentTeam?._id || coach?.currentTeam}`
  );
  const { data: trainings, isLoading: trainingLoading } = useFetch(
    `/api/admin/training/${coach?._id || team?.coach?._id}`,
    [refreshKey]
  );

  const [activeTab, setActiveTab] = useState('active');
  const [processedTrainings, setProcessedTrainings] = useState({
    activeTrainings: [],
    completedTrainings: [],
  });

  const isLoading = playerLoading || coachLoading || !team || trainingLoading;

  useEffect(() => {
    if (trainings && currentUser?.role === 'Player' && player?._id) {
      const processTrainings = (trainingsList) => {
        return trainingsList.map((training) => ({
          ...training,
          isNew: !training.isRead?.includes(player._id) && training.isActive,
        }));
      };

      setProcessedTrainings({
        activeTrainings: processTrainings(
          trainings.filter((training) => training?.isActive)
        ),
        completedTrainings: processTrainings(
          trainings.filter((training) => training?.isCompleted)
        ),
      });
    } else if (trainings) {
      setProcessedTrainings({
        activeTrainings: trainings.filter((training) => training?.isActive),
        completedTrainings: trainings.filter(
          (training) => training?.isCompleted
        ),
      });
    }
  }, [trainings, player?._id, currentUser?.role]);

  if (isLoading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  if (!coach?.currentTeam && !player?.currentTeam) {
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <View className='w-full max-w-md bg-white rounded-xl p-6 shadow-lg'>
          <MaterialCommunityIcons
            name='account-group'
            size={isSmallScreen ? 48 : 64}
            color='#3b82f6'
            className='self-center mb-4'
          />
          <Text
            className={`text-center ${
              isSmallScreen ? 'text-base' : 'text-lg'
            } text-gray-800`}
          >
            You are not assigned to any team yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView
        className='flex-1 px-3 py-4'
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={triggerGlobalRefresh}
            colors={['#6B46C1']}
          />
        }
      >
        <View className='space-y-5'>
          {/* Team Card */}
          <View className='bg-white rounded-xl shadow-sm p-4'>
            <View
              className={`${
                isMediumScreen ? 'flex-col' : 'flex-row'
              } items-center justify-between`}
            >
              <View className='flex-row items-center space-x-3 mb-2'>
                <View className='bg-blue-100 p-2 rounded-full'>
                  <MaterialCommunityIcons
                    name='account-group'
                    size={isSmallScreen ? 22 : 26}
                  />
                </View>
                <Text
                  className={`${
                    isSmallScreen ? 'text-xl' : 'text-2xl'
                  } font-bold text-gray-800`}
                  numberOfLines={2}
                  ellipsizeMode='tail'
                >
                  {team?.name}
                </Text>
              </View>
              <Image
                source={{
                  uri:
                    team?.logoUrl ||
                    'https://d3awt09vrts30h.cloudfront.net/team_img_default.png',
                }}
                className={`${
                  isMediumScreen ? 'w-24 h-24' : 'w-28 h-28'
                } rounded-xl self-center`}
                resizeMode='contain'
              />
            </View>
          </View>

          {/* Tabs */}
          <View className='bg-white rounded-2xl shadow-sm p-1 flex-row'>
            <TouchableOpacity
              onPress={() => setActiveTab('active')}
              className={`flex-1 flex-row items-center justify-center py-2 px-2 rounded-2xl ${
                activeTab === 'active' ? 'bg-purple-500' : 'bg-transparent'
              }`}
            >
              <Ionicons
                name='flash'
                size={isSmallScreen ? 18 : 20}
                color={activeTab === 'active' ? 'white' : '#374151'}
              />
              <Text
                className={`${
                  isSmallScreen ? 'text-sm ml-1' : 'text-base ml-2'
                } ${activeTab === 'active' ? 'text-white' : 'text-gray-700'}`}
              >
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('completed')}
              className={`flex-1 flex-row items-center justify-center py-2 px-2 rounded-2xl ${
                activeTab === 'completed' ? 'bg-purple-500' : 'bg-transparent'
              }`}
            >
              <FontAwesome
                name='trophy'
                size={isSmallScreen ? 16 : 20}
                color={activeTab === 'completed' ? 'white' : '#374151'}
              />
              <Text
                className={`${
                  isSmallScreen ? 'text-sm ml-1' : 'text-base ml-2'
                } ${
                  activeTab === 'completed' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Completed
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'active' ? (
            <ActiveTrainings
              trainings={processedTrainings.activeTrainings}
              currentUser={currentUser}
              currentTeamId={team?._id}
              playerId={player?._id}
              isSmallScreen={isSmallScreen}
            />
          ) : (
            <ActiveTrainings
              trainings={processedTrainings.completedTrainings}
              isArchived
              currentUser={currentUser}
              isSmallScreen={isSmallScreen}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrainingPage;
