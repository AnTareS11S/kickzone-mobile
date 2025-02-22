import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import useFetch from '../../hooks/useFetch';

const RefereeDetails = () => {
  const { id: refereeId } = useLocalSearchParams();
  const router = useRouter();
  const { data: referee, isLoading: loading } = useFetch(
    `/api/referee/${refereeId}`
  );
  const { data: refereeStats } = useFetch(
    `/api/referee/referee-stats/${refereeId}`
  );

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' color='#4263EB' />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1'>
      <View className='px-4 py-8'>
        {/* Card */}
        <View className='bg-white rounded-lg shadow-md overflow-hidden'>
          {/* Card Header */}
          <View className='bg-gradient-to-r from-blue-500 to-purple-600 p-6'>
            <View className='items-center'>
              <View className='w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4'>
                <Image
                  source={{
                    uri:
                      referee?.imageUrl ||
                      'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
                  }}
                  className='w-full h-full'
                  resizeMode='cover'
                />
              </View>
              <View className='items-center'>
                <Text className='text-3xl font-bold mb-2'>
                  {referee?.name} {referee?.surname}
                </Text>
                <Text className='text-lg text-center'>{referee?.bio}</Text>
              </View>
            </View>
          </View>

          {/* Card Content */}
          <View className='p-6'>
            {/* Personal Information */}
            <View className='mb-8'>
              <Text className='text-2xl font-semibold text-gray-800 mb-4'>
                Personal Information
              </Text>
              <InfoItem
                iconName='birthday-cake'
                IconComponent={Icon}
                label='Birth Date'
                value={referee.birthDate?.toString()?.slice(0, 10)}
              />
              <InfoItem
                iconName='flag'
                IconComponent={Icon}
                label='Nationality'
                value={referee?.nationality?.name}
              />
              <InfoItem
                iconName='map-marker-alt'
                IconComponent={IconFA}
                label='City'
                value={referee?.city}
              />
            </View>

            {/* Referee Statistics */}
            <View>
              <Text className='text-2xl font-semibold text-gray-800 mb-4'>
                Referee Statistics
              </Text>
              <InfoItem
                iconName='square'
                IconComponent={Icon}
                label='Yellow Cards'
                value={refereeStats?.yellowCards || 0}
                iconColor='#F59E0B'
              />
              <InfoItem
                iconName='square'
                IconComponent={Icon}
                label='Red Cards'
                value={refereeStats?.redCards || 0}
                iconColor='#EF4444'
              />
              <InfoItem
                iconName='sports-soccer'
                IconComponent={MaterialIcon}
                label='Matches'
                value={refereeStats?.matches || 0}
              />
              <LastMatch
                lastMatchId={refereeStats?.lastMatchId}
                lastMatchName={refereeStats?.lastMatchName}
                router={router}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const InfoItem = ({
  iconName,
  IconComponent,
  label,
  value,
  iconColor = '#6B7280',
}) => (
  <View className='flex-row items-center space-x-3 mb-4'>
    <IconComponent name={iconName} size={24} color={iconColor} />
    <View className='ml-3'>
      <Text className='text-sm text-gray-500'>{label}</Text>
      <Text className='text-lg font-medium text-gray-900'>{value}</Text>
    </View>
  </View>
);

const LastMatch = ({ lastMatchId, lastMatchName, router }) => (
  <View className='flex-row items-center space-x-3 mb-4'>
    <Icon name='calendar' size={24} color='#6B7280' />
    <View className='ml-3'>
      <Text className='text-sm text-gray-500'>Last Match as Referee</Text>
      {lastMatchId ? (
        <TouchableOpacity onPress={() => router.push(`/result/${lastMatchId}`)}>
          <Text className='text-lg font-medium text-blue-600'>
            {lastMatchName}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text className='text-lg font-medium text-gray-900'>N/A</Text>
      )}
    </View>
  </View>
);

export default RefereeDetails;
