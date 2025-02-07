import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Controller } from 'react-hook-form';
import { icons } from '../constants';

const FormField = ({
  control,
  name,
  title,
  placeholder,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  otherStyles,
  rules = {}, // Validation rules
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View className={`mb-4 ${otherStyles}`}>
          <Text className='text-base text-gray-700 font-semibold mb-2'>
            {title}
          </Text>

          <View
            className={`flex-row items-center bg-white rounded-xl border ${
              error ? 'border-red-500' : 'border-gray-300'
            } shadow-sm`}
            style={{ height: 55, paddingHorizontal: 15 }}
          >
            <TextInput
              className={`flex-1 text-base ${
                error ? 'text-red-500' : 'text-gray-800'
              } font-medium`}
              value={value}
              placeholder={placeholder}
              placeholderTextColor='#A1A1AA'
              onChangeText={onChange} // react-hook-form controls this
              onBlur={onBlur} // Helps with validation on blur
              keyboardType={keyboardType}
              secureTextEntry={isPassword && !showPassword}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
            />

            {isPassword && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image
                  source={showPassword ? icons.eye : icons.eyeHide}
                  className='w-6 h-6 opacity-70'
                  resizeMode='contain'
                />
              </TouchableOpacity>
            )}
          </View>

          {error && (
            <Text className='text-red-500 text-sm mt-1'>{error.message}</Text>
          )}
        </View>
      )}
    />
  );
};

export default FormField;
