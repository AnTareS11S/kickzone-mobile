import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useFetch from '../../hooks/useFetch';

const Card = ({ children }) => (
  <View className='bg-white rounded-lg shadow-sm mb-4 overflow-hidden'>
    {children}
  </View>
);

const CardHeader = ({ children }) => (
  <View className='p-4 border-b border-gray-100'>{children}</View>
);

const CardTitle = ({ children }) => (
  <Text className='text-xl font-bold text-gray-900 tracking-tight'>
    {children}
  </Text>
);

const CardContent = ({ children }) => <View className='p-4'>{children}</View>;

const PrivacyPage = () => {
  const { data: privacy, isLoading: loading } = useFetch('/api/admin/privacy');

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center bg-white'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <ScrollView
        className='flex-1'
        contentContainerClassName='p-4'
        showsVerticalScrollIndicator={false}
      >
        {privacy &&
          privacy
            .filter((item) => item.active)
            .map((item, index) => (
              <Card key={item._id || index.toString()}>
                <CardHeader>
                  <CardTitle>{item.term}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text className='text-gray-700 tracking-tight leading-relaxed'>
                    {item.content}
                  </Text>
                </CardContent>
              </Card>
            ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPage;
