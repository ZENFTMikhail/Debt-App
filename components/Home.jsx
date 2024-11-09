import React, { useState, useContext } from 'react';
import { View, Text, Modal, TouchableOpacity, Button } from 'react-native';
import styled from 'styled-components/native';
import { Calendar } from 'react-native-calendars';
import { LoadDateContext } from './LoadDateContext';
import * as Notifications from 'expo-notifications';


const { DateTime } = require("luxon");




export const Home = () => {
  const { loadDate, paymentDates, Allpayment, AllCredit, userDates, fetchData, getAllCredit } = useContext(LoadDateContext);
  const AllCreditMath = Math.round(AllCredit);

  const [modalVisible, setModalVisible] = useState(false); 
  const [modalContent, setModalContent] = useState('');    
  const [notificationSent, setNotificationSent] = useState(false); 
  // const [name, setName] = useState();
  // const [payment, setPayment] = useState();



const novosibirskTime = DateTime.now().setZone("Asia/Novosibirsk");
 

React.useEffect(() =>{

  const askNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Разрешение на уведомления не предоставлено!');
      return;
    }
   
  };

  askNotificationPermission();

  fetchData();
  getAllCredit();
},[])


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
  const userForUpcomingPayment = userDates[upcomingPaymentDate]?.[0]?.name || 'Неизвестный пользователь';

  const scheduleNotification = async ( paymentDate, name, payment) => {
    const notificationTime = new Date(paymentDate);
    notificationTime.setHours(12, 9, 0, 0);

    const notificationContent = {
      title: 'Напоминание о платеже',
      body: `Сегодня платёж у ${name} сумма ${payment}!`,
    };
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          date: notificationTime,
          repeats: false,
        },
      });
    } catch (error) {
      console.error('Ошибка при планировании уведомления:', error);
    }
  
  
  };

  const sendPushSms = async (phone, name, payment) => {

    const { SmsAero, SmsAeroError, SmsAeroHTTPError } = require('smsaero');

    const client = new SmsAero('seriesmisha777own@gmail.com', 'eG6N2mR_QvlCLKugpnvQ6mndthPRiv7C');


    try {
      const response = await client.send(phone, `Доброго дня, ${name} сегодня платёж по договору! Сумма ${payment} руб.`);
      console.log(response);
    } catch (error) {
      if (error instanceof SmsAeroError) {
        console.error('Не удалось из-за ошибки SmsAero:', error.message);
      } else if (error instanceof SmsAeroHTTPError) {
        console.error('Не удалось из-за HTTP ошибки:', error.message);
      } else {
        console.error('Произошла неизвестная ошибка:', error);
      }
    }
};







  React.useEffect(() => {
    if (notificationSent) return; // Если уведомление уже отправлено, выходим из useEffect

    const today = novosibirskTime.toISODate();
    const now = novosibirskTime.toLocaleString(DateTime.TIME_24_SIMPLE);
    
   

    // Перебираем все даты платежей
    paymentDates.forEach((paymentDate) => {
      if (paymentDate === today) {
        console.log(now);
        // Найдем пользователей, у которых есть платеж на эту дату
        const users = userDates[paymentDate] || [];
        users.forEach(user => {

          const {phone, name, payment} = user;

          
         
          

          if (now === '12:26') {
            console.log(user.name)
          }

          scheduleNotification(paymentDate, user.name, user.payment);
         
        });

        // Устанавливаем флаг, что уведомление отправлено
        setNotificationSent(true);
      }
    });
  }, [paymentDates, userDates, notificationSent]);
 

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    const users = userDates[selectedDate];
    
    if (users && users.length > 0) {
      // Формируем содержимое модального окна с именем и платежами
      const modalText = users
        .map(user => `Клиент: ${user.name}, Платёж: ${user.payment}`)
        .join('\n');
      setModalContent(modalText);  
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
          style={{borderWidth: 2, borderRadius: 15, borderColor: '#3A4A7D', height: 320 }}
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
              <CloseButtonText>Закрыть </CloseButtonText>
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
  border-width: 2px;
  border-color: #3A4A7D;
 
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
