import React from 'react';
import { View, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';

const PickerField = ({
  control,
  name,
  title,
  options = [], // options array for picker items
  defaultValue = '',
  rules,
}) => {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text className='text-gray-600 mb-2'>{title}</Text>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <View style={{ width: '100%' }}>
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={{
                height: 50,
                width: '100%',
                borderColor: error ? 'red' : '#ccc',
                borderWidth: 1,
                borderRadius: 5,
              }}
            >
              {/* Default first option */}
              <Picker.Item label='Select an option' value='' />
              {/* Dynamically render options */}
              {options.map((option, index) => (
                <Picker.Item
                  key={index}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>

            {/* Display error message */}
            {error && (
              <Text className='text-red-500 text-sm mt-1'>{error.message}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default PickerField;
