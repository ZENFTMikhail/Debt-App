import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';




export const LoadingStart = () => {
  
  const dollarTranslateY = useRef(new Animated.Value(20)).current;


  


  React.useEffect(() => {
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
  colors: ['#6683de', '#80deea', '#6683de'],
  start: { x: 10, y: 10 },
  end: { x: 1, y: 1 },
})`
  flex: 1;
`

  return (
  
      <GradientContainer>   
         <StatusBar barStyle="light-content" showHideTransition="fade" backgroundColor="#6683de" />
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

 