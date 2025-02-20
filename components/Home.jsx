import React from 'react';
import { View, Text, Modal, TouchableOpacity, Button, Alert, Platform} from 'react-native';
import styled from 'styled-components/native';
import { Calendar } from 'react-native-calendars';
import { LoadDateContext } from './LoadDateContext';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';
import CustomButton from './CustomButton';




Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

Notifications.setBadgeCountAsync(0);


async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
    
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = await response.json();
    console.log('Push Notification Response:', data);
    Alert.alert('Notification Sent', 'Push notification has been sent successfully!');
  } catch (error) {
    console.error('Error sending notification:', error);
    Alert.alert('Error', 'Failed to send push notification.');
  }
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Error', 'Permission not granted for push notifications.');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

    if (!projectId) {
      Alert.alert('Error', 'Project ID not found.');
      return null;
    }

    try {
      const pushToken = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      console.log('Expo Push Token:', pushToken);
      return pushToken;
    } catch (error) {
      console.error('Error getting push token:', error);
      Alert.alert('Error', 'Failed to get push token.');
      return null;
    }
  } else {
    Alert.alert('Error', 'Must use a physical device for push notifications.');
    return null;
  }
}




export const Home = () => {
  const { loadDate, paymentDates, Allpayment, AllCredit, userDates, fetchData, getAllCredit } = React.useContext(LoadDateContext);
  const AllCreditMath = Math.round(AllCredit);

  const [modalVisible, setModalVisible] = React.useState(false); 
  const [modalContent, setModalContent] = React.useState('');    
  const [expoPushToken, setExpoPushToken] = React.useState('');
  const [notification, setNotification] = React.useState(null);
  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  const [paymentClients,setPaymentClient] = React.useState([]);
 
  const { DateTime } = require("luxon");


  const novosibirskTime = DateTime.now().setZone("Asia/Novosibirsk");
  const today = novosibirskTime.toISODate();
  const now = novosibirskTime.toLocaleString(DateTime.TIME_24_SIMPLE);


  // React.useEffect(() => {

  //   setTimeout(() => { const allData = async () => {
  //     const db = await SQLite.openDatabaseAsync('BDuser3');
  //     const result = await db.getAllAsync('SELECT name, datepay, phone, payment FROM BDuser3');
  
  //     if (result.length > 0) {
  //       try {
  //         const response = await fetch('https://db-dupt-f3417235da6c.herokuapp.com/api/save-users', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({ users: result }),
  //         });
  
  //         const data = await JSON.parse(JSON.stringify(response));
  //         console.log('Отправлено на сервер BDuser3', data);
  //       } catch (error) {
  //         console.log('Ошибка отправки данных', error);
  //       }
  //     }
  //   };
  
  //   allData();}, 9000)
   
  // }, []);

  // React.useEffect(() => {

  //   setTimeout(() => {const allDataInvest = async () => {
  //     const db = await SQLite.openDatabaseAsync('BDInvest1');
  //     const result = await db.getAllAsync('SELECT name, datepay, payment FROM BDInvest1');
  
  //     if (result.length > 0) {
  //       try {
  //         const response = await fetch('https://db-dupt-f3417235da6c.herokuapp.com/api/save-invest', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({ invest: result }),
  //         });
  
  //         const data = await JSON.parse(JSON.stringify(response));
  //         console.log('Отправлено на сервер', data);
  //       } catch (error) {
  //         console.log('Ошибка отправки данных BDinvest', error);
  //       }
  //     }
  //   };
  
  //   allDataInvest();}, 8000)
    
  // }, []);

  
React.useEffect(() => {
  fetch('https://db-dupt-f3417235da6c.herokuapp.com/api/ping');
  console.log('Отправлено');
})

  


React.useEffect(() => {
  registerForPushNotificationsAsync()
    .then(token => setExpoPushToken(token || ''))
    .catch(error => console.error('Error during registration:', error));

  notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    setNotification(notification);
  });

  responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response:', response);
  });

  return () => {
    if (notificationListener.current) {
      Notifications.removeNotificationSubscription(notificationListener.current);
    }
    if (responseListener.current) {
      Notifications.removeNotificationSubscription(responseListener.current);
    }
  };
}, []);





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

  // Сортируем даты и берём ближайшую
  const upcomingPaymentDate = paymentDates
    .filter(date => date >= today)
    .sort()[0];  // Берём первую (ближайшую)

  // Ищем пользователя для этой даты
  const userForUpcomingPayment = userDates[upcomingPaymentDate]?.[0]?.name || 'Нет платежей';
  const userPayment = userDates[upcomingPaymentDate]?.[0]?.payment;







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
        <Text style={{textAlign: 'center'}}>Общая информация:</Text>
        <InfoText>Выдано кредитов: {AllCreditMath} руб.</InfoText>
        <InfoText>Всего платежей: {Allpayment} руб. </InfoText>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
         
       
      </View>
     
    
      </InfoBox>
      <InfoBox>
      <Text style={{textAlign: 'center'}}>Следующий платеж:</Text>
        <InfoText style={{textAlign:'center'}}>
         {userForUpcomingPayment}
        </InfoText>
        <InfoText style={{textAlign: 'center'}}>
         {upcomingPaymentDate}, {userPayment} руб.

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
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-width: 2px;
  border-color: #3A4A7D;
 
`;

const InfoText = styled.Text`
  color: #333;
  font-size: 18px;
  font-weight: bold;

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
