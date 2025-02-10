import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../../../lib/api';

const SearchResult = ({ title, items, iconName, linkPrefix }) => {
  const navigation = useNavigation();

  return (
    <View className='my-2'>
      <View className='flex-row items-center mb-2 gap-2'>
        <Icon name={iconName} size={20} className='mr-2' />
        <Text className='text-lg font-bold'>{title}</Text>
      </View>
      <View className='border-t border-gray-200 mb-2' />
      {items.map((item) => (
        <TouchableOpacity
          key={item._id}
          onPress={() => navigation.navigate(linkPrefix, { id: item._id })}
          className='bg-white rounded-lg shadow-sm mb-2 p-2'
        >
          <View className='flex-row items-center'>
            <Image
              source={{
                uri:
                  item.imageUrl ||
                  item.logoUrl ||
                  'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
              }}
              className='w-12 h-12 rounded-full mr-2'
            />
            <View>
              <Text className='text-base font-semibold'>
                {item.name} {item.surname}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Search = () => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (!search) {
        setSearchResults({});
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.get(`/api/player`, {
          params: { q: search },
        });

        if (res.status === 200) {
          setSearchResults(res.data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);

    return () => {
      clearTimeout(debounce);
    };
  }, [search]);

  const clearSearch = () => {
    setSearch('');
  };

  return (
    <View className='flex-1 p-4'>
      <View className='flex-row items-center bg-white rounded-lg shadow-sm mb-4 px-2'>
        <Icon name='search' size={20} color='gray' />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder='Search...'
          placeholderTextColor='gray'
          className='flex-1 py-2 px-2'
        />
        {search ? (
          <TouchableOpacity onPress={clearSearch} className='p-2'>
            <Icon name='times' size={20} color='gray' />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView>
        {isLoading ? (
          <ActivityIndicator size='large' color='#0000ff' />
        ) : search ? (
          <>
            {searchResults.players && searchResults.players.length > 0 && (
              <SearchResult
                title='Players'
                items={searchResults.players}
                iconName='user'
                linkPrefix='Player'
              />
            )}
            {searchResults.coaches && searchResults.coaches.length > 0 && (
              <SearchResult
                title='Coaches'
                items={searchResults.coaches}
                iconName='user-secret'
                linkPrefix='Coach'
              />
            )}
            {searchResults.referees && searchResults.referees.length > 0 && (
              <SearchResult
                title='Referees'
                items={searchResults.referees}
                iconName='gavel'
                linkPrefix='Referee'
              />
            )}
            {searchResults.teams && searchResults.teams.length > 0 && (
              <SearchResult
                title='Teams'
                items={searchResults.teams}
                iconName='futbol-o'
                linkPrefix='Team'
              />
            )}
            {Object.values(searchResults).every((arr) => arr.length === 0) && (
              <Text className='text-center text-gray-500 my-4'>
                No results found.
              </Text>
            )}
          </>
        ) : (
          <Text className='text-center text-gray-500 my-4'>
            Search for players, coaches, referees, and teams.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Search;
