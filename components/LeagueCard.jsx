import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const LeagueCard = ({ data }) => {
  const router = useRouter();
  return (
    <View className={`space-y-4`}>
      {data.map((league, index) => (
        <TouchableOpacity
          key={league._id || index}
          onPress={() =>
            router.push({
              pathname: `/league/${league._id}`,
              params: { name: league.name },
            })
          }
          className={`bg-white border border-gray-200 rounded-lg p-4 flex-row items-center shadow-sm`}
        >
          <View
            className={`w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4`}
          >
            <Icon name='shield' size={24} className={`text-gray-400`} />
          </View>

          <View className={`flex-1`}>
            <Text className={`text-lg font-semibold text-gray-800`}>
              {league.name}
            </Text>
          </View>

          <Icon name='chevron-right' size={16} className={`text-gray-400`} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default LeagueCard;
