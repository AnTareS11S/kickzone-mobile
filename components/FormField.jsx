import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';

import { icons } from '../constants';

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  isPassword = false,
  keyboardType = 'default',
  error,
  autoCapitalize = 'none',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`mb-4 ${otherStyles}`}>
      <Text
        className='text-base text-gray-700 font-semibold mb-2'
        accessibilityLabel={`${title} input field`}
      >
        {title}
      </Text>

      <View
        className={`flex-row items-center bg-white rounded-xl border ${
          error ? 'border-red-500' : 'border-gray-300'
        } shadow-sm`}
        style={{
          height: 55,
          paddingHorizontal: 15,
        }}
      >
        <TextInput
          className={`flex-1 text-base ${
            error ? 'text-red-500' : 'text-gray-800'
          } font-medium`}
          value={value}
          placeholder={placeholder}
          placeholderTextColor='#A1A1AA'
          onChangeText={(text) => {
            handleChangeText(text);
          }}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          accessibilityLabel={placeholder}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={
              showPassword ? 'Hide password' : 'Show password'
            }
            accessibilityRole='button'
          >
            <Image
              source={showPassword ? icons.eye : icons.eyeHide}
              className='w-6 h-6 opacity-70'
              resizeMode='contain'
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View className='mt-1'>
          <Text className='text-red-500 text-sm'>{error}</Text>
        </View>
      )}
    </View>
  );
};

export default FormField;
