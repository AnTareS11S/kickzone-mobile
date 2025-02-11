import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const CustomButton = ({
  title,
  handlePress,
  containerStyles = '',
  textStyles = '',
  isLoading = false,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  sendingIndicator,
}) => {
  // Button style variants
  const variantStyles = {
    primary: {
      container: 'bg-purple-500 border border-blue-600',
      text: 'text-white',
      disabledContainer: 'bg-purple-300 border-blue-300',
    },
    secondary: {
      container: 'bg-gray-100 border border-gray-200',
      text: 'text-gray-800',
      disabledContainer: 'bg-gray-50 border-gray-100',
    },
    outline: {
      container: 'bg-transparent border border-blue-600',
      text: 'text-blue-600',
      disabledContainer: 'border-gray-300',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading || disabled}
      className={`
        ${currentVariant.container}
        rounded-xl 
        min-h-[62px] 
        justify-center 
        items-center 
        ${fullWidth ? 'w-full' : ''}
        ${isLoading || disabled ? currentVariant.disabledContainer : ''}
        ${containerStyles}
      `}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? 'white' : 'blue'}
          size='small'
        />
      ) : (
        <Text
          className={`
            text-lg 
            font-semibold 
            ${currentVariant.text}
            ${textStyles}
          `}
        >
          {disabled ? sendingIndicator : title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
