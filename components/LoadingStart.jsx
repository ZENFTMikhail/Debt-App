import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';




export const LoadingStart = () => {
  
  const dollarTranslateY = useRef(new Animated.Value(20)).current;


  


  useEffect(() => {
    Animated.timing(dollarTranslateY, {
      toValue: 70,
      duration: 2000, 
      useNativeDriver: true,
    }).start();
  }, []);


  const Wallet = styled.View`
    align-items: center;
    padding-top: 300px;
  `;
 
const GradientContainer = styled(LinearGradient).attrs({
  colors: ['#e0f7fa', '#80deea', '#4dd0e1'],
  start: { x: 10, y: 10 },
  end: { x: 1, y: 1 },
})`
  flex: 1;
`

  return (
  
      <GradientContainer>   
         <Wallet>
     
      <Animated.Image
        source={require('../assets/dollar.png')}
        style={{ transform: [{ translateY: dollarTranslateY }] }}
      />

      <Image source={require('../assets/wallet.png')} />
    </Wallet>
    </GradientContainer>

    
  );
};

