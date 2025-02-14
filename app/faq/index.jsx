import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useFetch from '../../hooks/useFetch';

const FadeInView = ({ children, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  return (
    <View className='border-b border-gray-200 py-4 px-5'>
      <TouchableOpacity
        className='flex-row items-center justify-between'
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text className='flex-1 text-lg font-semibold text-gray-900'>
          {question}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color='#6B7280'
        />
      </TouchableOpacity>

      {isOpen && (
        <FadeInView>
          <View className='mt-2'>
            <Text className='text-base text-gray-600 leading-relaxed tracking-tight'>
              {answer}
            </Text>
          </View>
        </FadeInView>
      )}
    </View>
  );
};

const FAQView = () => {
  const { data: faqs, isLoading: loading } = useFetch('/api/admin/faq');
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center bg-white'>
        <ActivityIndicator size='large' color='#6B46C1' />
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView
        className='flex-1'
        contentContainerClassName='px-4 py-8'
        showsVerticalScrollIndicator={false}
      >
        <View className='space-y-4'>
          {faqs &&
            faqs
              .filter((faq) => faq.active)
              .map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={activeIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQView;
