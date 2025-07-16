import React, { useEffect } from 'react';
import { View } from 'react-native';

export const TempComponent = () => {
  useEffect(() => {
    console.log('test');
  }, []);
  
  return <View />;
};
