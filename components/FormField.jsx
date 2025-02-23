import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { Controller } from 'react-hook-form';
import { icons } from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome';

const FormField = ({
  control,
  name,
  title,
  placeholder,
  isPassword = false,
  isDate = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  otherStyles,
  editable = true,
  rules = {},
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const generateArrayOfYears = () => {
    const max = new Date().getFullYear();
    const min = max - 100;
    const years = [];
    for (let i = max; i >= min; i--) {
      years.push(i);
    }
    return years;
  };

  const generateArrayOfMonths = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2000, i, 1).toLocaleString('default', {
        month: 'long',
      });
      return { value: i, label: month };
    });
  };

  const generateArrayOfDays = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const DatePickerModal = ({ value, onChange, onClose }) => {
    const currentDate = value || new Date();
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

    const years = generateArrayOfYears();
    const months = generateArrayOfMonths();
    const days = generateArrayOfDays(selectedYear, selectedMonth);

    const handleYearChange = (direction) => {
      const currentIndex = years.indexOf(selectedYear);
      if (direction === 'up' && currentIndex > 0) {
        setSelectedYear(years[currentIndex - 1]);
      } else if (direction === 'down' && currentIndex < years.length - 1) {
        setSelectedYear(years[currentIndex + 1]);
      }
    };

    const handleConfirm = () => {
      const newDate = new Date(selectedYear, selectedMonth, selectedDay);
      onChange(newDate);
      onClose();
    };

    return (
      <Modal
        animationType='slide'
        transparent={true}
        visible={true}
        onRequestClose={onClose}
      >
        <View className='flex-1 justify-end bg-black/50'>
          <View className='bg-white rounded-t-xl p-4'>
            <View className='flex-row justify-between items-center mb-4'>
              <Text className='text-lg font-semibold'>Select Date</Text>
              <TouchableOpacity onPress={onClose}>
                <Text className='text-purple-500'>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className='flex-row justify-between mb-4'>
              <View className='flex-1 mr-2'>
                <Text className='text-gray-600 mb-1'>Month</Text>
                <View className='border border-gray-300 rounded-lg'>
                  <TouchableOpacity
                    className='p-2 border-b border-gray-200'
                    onPress={() => setSelectedMonth((prev) => (prev + 11) % 12)}
                  >
                    <Text className='text-center'>▲</Text>
                  </TouchableOpacity>
                  <View className='p-2'>
                    <Text className='text-center'>
                      {months[selectedMonth].label}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className='p-2 border-t border-gray-200'
                    onPress={() => setSelectedMonth((prev) => (prev + 1) % 12)}
                  >
                    <Text className='text-center'>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className='flex-1 mx-2'>
                <Text className='text-gray-600 mb-1'>Day</Text>
                <View className='border border-gray-300 rounded-lg'>
                  <TouchableOpacity
                    className='p-2 border-b border-gray-200'
                    onPress={() =>
                      setSelectedDay((prev) =>
                        prev <= 1 ? days.length : prev - 1
                      )
                    }
                  >
                    <Text className='text-center'>▲</Text>
                  </TouchableOpacity>
                  <View className='p-2'>
                    <Text className='text-center'>{selectedDay}</Text>
                  </View>
                  <TouchableOpacity
                    className='p-2 border-t border-gray-200'
                    onPress={() =>
                      setSelectedDay((prev) =>
                        prev >= days.length ? 1 : prev + 1
                      )
                    }
                  >
                    <Text className='text-center'>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className='flex-1 ml-2'>
                <Text className='text-gray-600 mb-1'>Year</Text>
                <View className='border border-gray-300 rounded-lg'>
                  <TouchableOpacity
                    className='p-2 border-b border-gray-200'
                    onPress={() => handleYearChange('up')}
                  >
                    <Text className='text-center'>▲</Text>
                  </TouchableOpacity>
                  <View className='p-2'>
                    <Text className='text-center'>{selectedYear}</Text>
                  </View>
                  <TouchableOpacity
                    className='p-2 border-t border-gray-200'
                    onPress={() => handleYearChange('down')}
                  >
                    <Text className='text-center'>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              className='bg-purple-500 rounded-lg p-3'
              onPress={handleConfirm}
            >
              <Text className='text-white text-center font-semibold'>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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
            {isDate ? (
              <>
                <TouchableOpacity
                  className='flex-1 flex-row items-center justify-between'
                  onPress={() => setShowDateModal(true)}
                >
                  <TextInput
                    className={`flex-1 text-base ${
                      error ? 'text-red-500' : 'text-gray-800'
                    } font-medium`}
                    value={value ? formatDate(value) : ''}
                    placeholder={placeholder}
                    placeholderTextColor='#A1A1AA'
                    editable={false}
                  />
                  <Icon
                    name='calendar'
                    size={20}
                    color='#A1A1AA'
                    className='mr-2'
                  />
                </TouchableOpacity>
                {showDateModal && (
                  <DatePickerModal
                    value={value}
                    onChange={(date) => {
                      onChange(date);
                      onBlur();
                    }}
                    onClose={() => setShowDateModal(false)}
                  />
                )}
              </>
            ) : (
              <>
                <TextInput
                  className={`flex-1 text-base ${
                    error ? 'text-red-500' : 'text-gray-800'
                  } font-medium`}
                  value={value}
                  placeholder={placeholder}
                  placeholderTextColor='#A1A1AA'
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType={keyboardType}
                  secureTextEntry={isPassword && !showPassword}
                  autoCapitalize={autoCapitalize}
                  autoCorrect={false}
                  editable={editable}
                />

                {isPassword && (
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Image
                      source={showPassword ? icons.eye : icons.eyeHide}
                      className='w-6 h-6 opacity-70'
                      resizeMode='contain'
                    />
                  </TouchableOpacity>
                )}
              </>
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
