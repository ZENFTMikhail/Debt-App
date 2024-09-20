import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';




const GradientContainer = styled(LinearGradient).attrs({
  colors: ['#3A4A7D', '#002366'], // светлый и темный оттенки синего
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  padding-bottom: 6px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
`;

const NavImage = styled.Text`
padding-left: 1px

`


export const Navbar = () => {
  const navigation = useNavigation();

  return (
    <GradientContainer>
      <TouchableOpacity  onPress={() => navigation.navigate('Home')}>
        <NavImage> <Image  source={require('../assets/main2.png')} /></NavImage>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('TableDB')}>
      <NavImage> <Image  source={require('../assets/users.png')} /></NavImage>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('AddClient')}>
        <NavImage style={{paddingTop: 2}}><Image  source={require('../assets/add.png')} /></NavImage>
      </TouchableOpacity>
    </GradientContainer>
  );
};