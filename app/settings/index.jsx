import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import ChangePassword from '../../components/ChangePassword';
import DeleteAccount from '../../components/DeleteAccount';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('password');

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='px-4 py-6 max-w-screen-md  space-y-6'>
        <View>
          <Text className='text-xl font-bold text-gray-900'>Settings</Text>
          <Text className='text-sm text-gray-500'>Manage your account</Text>
        </View>

        {/* Tab Navigation */}
        <View className='flex-row border-b border-gray-200'>
          <TouchableOpacity
            className={`py-3 px-4 ${
              activeTab === 'password' ? 'border-b-2 border-purple-500' : ''
            }`}
            onPress={() => setActiveTab('password')}
          >
            <Text
              className={`font-medium ${
                activeTab === 'password' ? 'text-purple-600' : 'text-gray-600'
              }`}
            >
              Change Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`py-3 px-4 ${
              activeTab === 'delete' ? 'border-b-2 border-purple-500' : ''
            }`}
            onPress={() => setActiveTab('delete')}
          >
            <Text
              className={`font-medium ${
                activeTab === 'delete' ? 'text-purple-600' : 'text-gray-600'
              }`}
            >
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'password' ? <ChangePassword /> : <DeleteAccount />}
      </View>
    </ScrollView>
  );
};

export default Settings;
