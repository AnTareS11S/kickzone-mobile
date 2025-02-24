import React from 'react';
import { Stack } from 'expo-router';
import TabsLayout from '../../components/TabsLayout';

export default function TabsLayoutWrapper() {
  return (
    <TabsLayout>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='home' />
        <Stack.Screen name='search/[query]' />
        <Stack.Screen name='training' />
        <Stack.Screen name='leagues' />
        <Stack.Screen name='create' />
      </Stack>
    </TabsLayout>
  );
}
