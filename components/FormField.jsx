import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { icons } from '../constants';

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  isPassword = false,
  keyboardType = 'default',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className='mb-4' style={otherStyles}>
      <Text
        className='text-base text-gray-700 font-semibold mb-2'
        accessibilityLabel={`${title} input field`}
      >
        {title}
      </Text>
      <View
        className='flex-row items-center bg-white rounded-xl border border-gray-300 shadow-sm'
        style={{
          height: 55,
          paddingHorizontal: 15,
        }}
      >
        <TextInput
          className='flex-1 text-base text-gray-800 font-medium'
          value={value}
          placeholder={placeholder}
          placeholderTextColor='#A1A1AA'
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize='none'
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
    </View>
  );
};

export default FormField;
