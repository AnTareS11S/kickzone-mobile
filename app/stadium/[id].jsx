import React from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import useFetch from '../../hooks/useFetch';

const StadiumDetails = () => {
  const { id: stadiumId } = useLocalSearchParams();
  const { data: stadium, isLoading: loading } = useFetch(
    `/api/admin/stadium/${stadiumId}`
  );
  const position = stadium?.location
    ? {
        latitude: parseFloat(stadium.location.split(',')[0]),
        longitude: parseFloat(stadium.location.split(',')[1]),
      }
    : null;

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' color='#4263EB' />
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='p-6'>
        {/* Stadium Details */}
        <View className='items-center mb-6'>
          <View className='w-32 h-32 rounded-full overflow-hidden mb-4'>
            <Image
              source={{ uri: stadium.imageUrl }}
              className='w-full h-full'
              resizeMode='cover'
            />
          </View>
          <View className='w-full items-center'>
            <Text className='text-2xl font-bold mb-2'>{stadium.name}</Text>
            <Text className='text-gray-600 text-center mb-4'>
              {stadium.history}
            </Text>
          </View>
        </View>

        {/* Stadium Info Grid */}
        <View className='mb-6'>
          <View className='flex-row mb-4'>
            <View className='flex-1'>
              <Text className='text-sm font-semibold text-gray-500'>
                Country:
              </Text>
              <Text className='text-gray-800'>{stadium?.country?.name}</Text>
            </View>
            <View className='flex-1'>
              <Text className='text-sm font-semibold text-gray-500'>City:</Text>
              <Text className='text-gray-800'>{stadium.city}</Text>
            </View>
          </View>
          <View className='flex-row'>
            <View className='flex-1'>
              <Text className='text-sm font-semibold text-gray-500'>
                Capacity:
              </Text>
              <Text className='text-gray-800'>
                {stadium.capacity ? `${stadium.capacity} seats` : 'N/A'}
              </Text>
            </View>
            <View className='flex-1'></View>
          </View>
        </View>

        {/* Map */}
        {position && (
          <View className='h-80 w-full'>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                ...position,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={position}>
                <Callout>
                  <Text>{stadium.name} Stadium</Text>
                </Callout>
              </Marker>
            </MapView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default StadiumDetails;
