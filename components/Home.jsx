import React, { useState, useContext } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Calendar } from 'react-native-calendars';
import { LoadDateContext } from './LoadDateContext';

export const Home = () => {
  const { loadDate, paymentDates, Allpayment, AllCredit, userDates } = useContext(LoadDateContext);
  const AllCreditMath = Math.round(AllCredit);

  const [modalVisible, setModalVisible] = useState(false); 
  const [modalContent, setModalContent] = useState('');    

  const markedDates = Array.isArray(loadDate) && loadDate.length > 0 
    ? loadDate.reduce((acc, date) => {
        acc[date] = { marked: true, dotColor: 'black' }; 
        return acc;
      }, {})
    : {};  

  const paymentMarkers = paymentDates.reduce((acc, date) => {
    acc[date] = { selected: true, selectedColor: 'blue' };  
    return acc;
  }, {});

  const allMarkers = { ...markedDates, ...paymentMarkers };

  const today = new Date().toISOString().split('T')[0];

  // Сортируем даты и берём ближайшую
  const upcomingPaymentDate = paymentDates
    .filter(date => date >= today)
    .sort()[0];  // Берём первую (ближайшую)

  // Ищем пользователя для этой даты
  const userForUpcomingPayment = userDates[upcomingPaymentDate]?.[0] || 'Неизвестный пользователь';



const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    const users = userDates[selectedDate];
    
    if (users && users.length > 0) {
      setModalContent(`Клиент: ${users.join(', ')}`);  
    } else {
      setModalContent('Нет данных для этой даты');
    }

    setModalVisible(true);  
  };

  return (
    <Container>
      <CalendarContainer>
        <Calendar 
          onDayPress={handleDayPress}
          markedDates={allMarkers}
          theme={{
            todayTextColor: '#00adf5',
            arrowColor: '#00adf5',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
          }}
        />
      </CalendarContainer>
      
      <InfoBox>
        <InfoText>Выдано кредитов: {AllCreditMath}</InfoText>
        <InfoText>Всего платежей: {Allpayment}</InfoText>
      </InfoBox>
      <InfoBox>
        <InfoText>
          Следующий платёж: {userForUpcomingPayment}
        </InfoText>
      </InfoBox>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}  
      >
        <ModalOverlay>
          <ModalContent>
            <ModalText>{modalContent}</ModalText>
            <CloseButton onPress={() => setModalVisible(false)}>
              <CloseButtonText>Закрыть</CloseButtonText>
            </CloseButton>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #f2f2f2;
`;

const CalendarContainer = styled.View`
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const InfoBox = styled.View`
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const InfoText = styled.Text`
  color: #333;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const ModalOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  align-items: center;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
  elevation: 5;
`;

const ModalText = styled.Text`
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
`;

const CloseButton = styled.TouchableOpacity`
  background-color: #00adf5;
  padding: 10px 20px;
  border-radius: 5px;
`;

const CloseButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;
