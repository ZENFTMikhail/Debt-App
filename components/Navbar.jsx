import React, { useState } from 'react';
import { TouchableOpacity, Image, View, Text, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width; // Ширина экрана

const GradientContainer = styled(LinearGradient).attrs({
  colors: ['#002366', '#3A4A7D'], // светлый и темный оттенки синего
  start: { x: 0, y: 0 },
  end: { x: 0, y: 2 },
})`
  padding-bottom: 10px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;



const NavImageR = styled.View`
padding-left: 22px;
padding-top: 5px;

`;

const NavImageL = styled.View`
padding-right: 25px;
`;

//top 613

const SidebarContainer = styled(Animated.View)`
  position: absolute;
  top: 613px;   
  left: 0;
  width: 225px;
  height: 30%;
  background-color: #002366;
  padding: 10px;
  z-index: 10;
  border-top-right-radius: 20px; 
   
`;

const SidebarItem = styled(TouchableOpacity)`
  
  margin-bottom: 5px;
  margin-top: 10px;
`;

const SidebarImg = styled.View`
  flex-direction: row;
  padding-bottom: 10px;
`;

export const Navbar = () => {
  const navigation = useNavigation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarPosition] = useState(new Animated.Value(-250)); // начальная позиция

  
  const toggleSidebar = () => {
    if (sidebarVisible) {
      closeSidebar(); // закрытие, если сайдбар открыт
    } else {
      setSidebarVisible(true); // открытие сайдбара
      Animated.timing(sidebarPosition, {
        toValue: 0, // показать сайдбар
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const closeSidebar = () => {
    Animated.timing(sidebarPosition, {
      toValue: -250, // скрыть сайдбар
      duration: 300,
      useNativeDriver: false,
    }).start(() => setSidebarVisible(false));
  };




  return (
    <>
      <GradientContainer>
        <TouchableOpacity onPress={toggleSidebar}>
          <NavImageR>
            <Image source={require('../assets/main2.png')} />
          </NavImageR>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddClient')}>
          <NavImageL >
            <Image  source={require('../assets/add.png')} />
          </NavImageL>
        </TouchableOpacity>
      </GradientContainer>

      {sidebarVisible && (
        <SidebarContainer style={{ transform: [{ translateX: sidebarPosition }] }}>
          <SidebarItem onPress={() => {navigation.navigate('Home'); closeSidebar();}}>
            <SidebarImg>
            <Image source={require('../assets/calendar.png')} style={{ marginRight: 5, width: 24, height: 23}}  />
            <Text style={{ color: '#fff', fontSize: 18 }}>Календарь платежей</Text>
          </SidebarImg>
          </SidebarItem>
        
          <SidebarItem onPress={() => {navigation.navigate('Investors'); closeSidebar();}}>
            <SidebarImg>
            <Image source={require('../assets/invest.png')} style={{ marginRight: 5, width: 25, height: 25}}  />
            <Text style={{ color: '#fff', fontSize: 18 }}>Мои инвесторы</Text>
            </SidebarImg>
          </SidebarItem>
          <SidebarItem  onPress={() =>  {navigation.navigate('TableDB'); closeSidebar();}}>
          <SidebarImg>
            <Image source={require('../assets/users.png')} style={{ marginRight: 5, width: 25, height: 25}}  />
            <Text style={{ color: '#fff', fontSize: 18 }}>Мои клиенты</Text>
            </SidebarImg>
          </SidebarItem>
          <SidebarItem  onPress={() =>  {navigation.navigate('Note'); closeSidebar();}}>
          <SidebarImg>
          <Image source={require('../assets/Note.png')} style={{ marginRight: 5, width: 25, height: 25}}  />
          <Text style={{ color: '#fff', fontSize: 18 }}>Заметки</Text>
          </SidebarImg>
          </SidebarItem>
        </SidebarContainer>
      )}
    </>
  );
};