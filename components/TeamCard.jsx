import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Card } from '@rneui/themed';
import { useRouter } from 'expo-router';

const TeamCard = ({ data, loading }) => {
  const router = useRouter();

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  const renderTeamCard = ({ item: team }) => (
    <TouchableOpacity
      className='flex-1 m-2'
      onPress={() => router.push(`/team/${team._id}`)}
      activeOpacity={0.7}
    >
      <Card
        containerStyle={{
          borderRadius: 8,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          padding: 0,
          margin: 0,
        }}
      >
        <View className='w-full h-60'>
          <Image
            source={{ uri: team.logoUrl }}
            className='w-full h-40'
            resizeMode='contain'
          />
          <View className='p-4'>
            <Text className='text-xl font-semibold text-center'>
              {team.name}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderTeamCard}
      keyExtractor={(team) => team._id}
      numColumns={2}
      className='mt-8'
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default TeamCard;
