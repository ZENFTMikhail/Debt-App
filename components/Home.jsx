import React from 'react';
import { View, Text, Modal, TouchableOpacity, Button, Alert} from 'react-native';
import styled from 'styled-components/native';
import { Calendar } from 'react-native-calendars';
import { LoadDateContext } from './LoadDateContext';
import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';





export const Home = () => {
  const { loadDate, paymentDates, Allpayment, AllCredit, userDates, fetchData, getAllCredit } = React.useContext(LoadDateContext);
  const AllCreditMath = Math.round(AllCredit);

  const [modalVisible, setModalVisible] = React.useState(false); 
  const [modalContent, setModalContent] = React.useState('');    

  const [paymentClients,setPaymentClient] = React.useState([]);
 
  const { DateTime } = require("luxon");


  const novosibirskTime = DateTime.now().setZone("Asia/Novosibirsk");
  const today = novosibirskTime.toISODate();
  const now = novosibirskTime.toLocaleString(DateTime.TIME_24_SIMPLE);
 

React.useEffect(() =>{

  const askNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Разрешение на уведомления не предоставлено!');
      return;
    }
   
  };

  askNotificationPermission();

  fetchData();
  getAllCredit();
},[])

// Функция для планирования уведомлений для клиентов
const schedulePaymentNotificationClient = async (date, clientName, clientPay, id) => {
  const now = new Date();
  const paymentDate = new Date(date);

  if (paymentDate <= now) return; // Не планируем уведомления на прошедшие даты

  const secondsUntilPayment = Math.floor((paymentDate - now) / 1000);

  try {
    // Создаем уведомление с уникальным идентификатором
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Клиент',
        body: `Сегодня платёж у ${clientName} сумма ${clientPay} руб.`,
      },
      trigger: { seconds: secondsUntilPayment, repeats: false },
      identifier: `client-${id}`, // Уникальный идентификатор для уведомлений клиентов
    });

    console.log(`Уведомление для клиента ${clientName} запланировано через ${secondsUntilPayment} секунд.`);
  } catch (error) {
    console.log('Ошибка при планировании уведомления для клиента:', error);
  }
};

// Функция для планирования уведомлений для инвесторов
const schedulePaymentNotificationInvestor = async (date, investName, investPay, id) => {
  const now = new Date();
  const paymentDate = new Date(date);

  if (paymentDate <= now) return;

  const secondsUntilPayment = Math.floor((paymentDate - now) / 1000);

  try {
    // Создаем уведомление с уникальным идентификатором
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Инвестор',
        body: `Сегодня платёж у ${investName} сумма ${investPay} руб.`,
      },
      trigger: { seconds: secondsUntilPayment, repeats: false },
      identifier: `investor-${id}`, // Уникальный идентификатор для уведомлений инвесторов
    });

    console.log(`Уведомление для инвестора ${investName} запланировано через ${secondsUntilPayment} секунд.`);
  } catch (error) {
    console.log('Ошибка при планировании уведомления для инвестора:', error);
  }
};

// Функция для отмены уведомлений для клиентов
const cancelClientNotifications = async () => {
  try {
    // Отменяем все уведомления, связанные с клиентами
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    const clientNotifications = notifications.filter(notification =>
      notification.identifier.startsWith('client-') // Отбираем только уведомления для клиентов
    );

    for (const notification of clientNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      console.log(`Отменено уведомление для клиента: ${notification.identifier}`);
    }
  } catch (error) {
    console.error('Ошибка при отмене уведомлений для клиентов:', error);
  }
};

// Функция для отмены уведомлений для инвесторов
const cancelInvestorNotifications = async () => {
  try {
    // Отменяем все уведомления, связанные с инвесторами
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    const investorNotifications = notifications.filter(notification =>
      notification.identifier.startsWith('investor-') // Отбираем только уведомления для инвесторов
    );

    for (const notification of investorNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      console.log(`Отменено уведомление для инвестора: ${notification.identifier}`);
    }
  } catch (error) {
    console.error('Ошибка при отмене уведомлений для инвесторов:', error);
  }
};

// Основной useEffect для обновления уведомлений
React.useEffect(() => {
  const UpdNotification = async () => {
    try {
      // Открываем базу данных для клиентов
      const dbclient = await SQLite.openDatabaseAsync('BD3');
      const result = await dbclient.getAllAsync('SELECT * FROM BD3');
      const usersClient = result.map(row => ({
        ...row,
        datepay: new Date(row.datepay),
      }));

      const sortClient = usersClient.sort((a, b) => a.datepay - b.datepay);
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      const twoDays = new Date();
      twoDays.setDate(now.getDate() + 2);
      // Отменяем старые уведомления для клиентов
      await cancelClientNotifications();

      const upcomingPayments = sortClient.filter(client => client.datepay > now && client.datepay < nextWeek);
      const todayPaymentsClients = usersClient.filter(client => {
        const clientDate = new Date(client.datepay).toISOString().split('T')[0]; // Преобразуем client.datepay в строку
        return clientDate === today;
      });     
            setPaymentClient(todayPaymentsClients);

      if (upcomingPayments.length > 0) {
        for (const payment of upcomingPayments) {
          const { datepay, name, payment: clientPay, id } = payment;
          const paymentDateWithTime = new Date(datepay);
          paymentDateWithTime.setHours(12, 0, 0, 0); // Устанавливаем время на 12:00
          
         


          // Планируем уведомление для каждого клиента
          await schedulePaymentNotificationClient(paymentDateWithTime, name, clientPay, id);
          console.log(`Уведомление для клиента ${name} запланировано на ${paymentDateWithTime}`);
        }
      } else {
        console.log('Нет предстоящих платежей у клиентов.');
      } 
      // Открываем базу данных для инвесторов
      const dbinvest = await SQLite.openDatabaseAsync('BDInvest1');
      const resultInvest = await dbinvest.getAllAsync('SELECT * FROM BDInvest1');
      const usersInvest = resultInvest.map(row => ({
        ...row,
        datepay: new Date(row.datepay),
      }));

      const sortInvest = usersInvest.sort((a, b) => a.datepay - b.datepay);
      const nextPaymentInvestor = sortInvest.find(invest => invest.datepay > now);

      // Отменяем старые уведомления для инвесторов
      await cancelInvestorNotifications();
      


      // Планируем уведомление для следующего инвестора
      if (nextPaymentInvestor) {
        const { datepay, name, payment, id } = nextPaymentInvestor;
        const paymentDateWithTime = new Date(datepay);
        paymentDateWithTime.setHours(11, 0, 0, 0);

        await schedulePaymentNotificationInvestor(paymentDateWithTime, name, payment, id);
        console.log(`Уведомление для инвестора ${name} запланировано на ${paymentDateWithTime}`);
      } else {
        console.log('Нет предстоящих платежей у инвесторов.');
      }
    } catch (error) {
      console.error('Ошибка при обновлении уведомлений:', error);
    }
  };

  UpdNotification();
  
 
}, []);

React.useEffect(() => {
  if (paymentClients.length > 0) {
    checkAndSendSms();
    console.log('Вызов checkAndSendSms после обновления состояния paymentClients');
  } else {
    console.log('paymentClients пустой, SMS не отправляется');
  }
}, [paymentClients]);

const checkAndSendSms = async () => {
  let db; // Переменная для базы данных
  try {
    // Получаем текущую дату в UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Сбрасываем время до 00:00:00 UTC

    console.log('Сегодняшняя дата (UTC):', today.toISOString());

    // Фильтруем пользователей с платежами на сегодня
    const todayPayments = paymentClients.filter(payment => {
      const paymentDate = new Date(payment.datepay);
      paymentDate.setUTCHours(0, 0, 0, 0); // Сбрасываем время платежной даты до 00:00:00 UTC

      console.log(`Проверка клиента: ${payment.name}, дата платежа: ${paymentDate.toISOString()}`);

      return paymentDate.getTime() === today.getTime();
    });

    console.log('Платежи на сегодня:', todayPayments);
  

    if (todayPayments.length === 0) {
      console.log('На сегодня платежей нет.');
      return;
    }

    // Открываем базу данных
    db = await SQLite.openDatabaseAsync('dataSMS');

    // Очистка старых записей
    await cleanOldSmsRecords(db);

    // Получаем уже отправленные SMS
    const existingSmsRecords = await db.getAllAsync('SELECT name FROM dataSMS WHERE status = "sent"');
    const sentNames = existingSmsRecords.map(record => record.name);

    // Отправляем SMS и записываем в базу
    for (const payment of todayPayments) {
      const { name, phone, payment: amount } = payment;

      if (!sentNames.includes(name)) {
        try {
          await sendPushSms(phone, name, amount);
          await markSmsAsSent(db, name);
        } catch (error) {
          console.error(`Ошибка при отправке SMS для ${name}:`, error);
        }
      } else {
        console.log(`SMS для ${name} уже отправлено.`);
      }
    }
  } catch (error) {
    console.error('Ошибка в checkAndSendSms:', error);
  } finally {
    if (db) {
      await db.closeAsync();
      console.log('База данных закрыта.');
    }
  }
};



const markSmsAsSent = async (db, name) => {
  try {
    const currentDate = new Date().toISOString();
    await db.runAsync('INSERT INTO dataSMS (name, status, date) VALUES (?, ?, ?);', [name, 'sent', currentDate]);
    console.log(`Запись для ${name} добавлена в базу.`);
  } catch (error) {
    console.error(`Ошибка при добавлении sads записи для ${name}:`, error);
  }
};

const cleanOldSmsRecords = async (db) => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoISO = twoDaysAgo.toISOString();

    await db.runAsync('DELETE FROM dataSMS WHERE date < ?;', [twoDaysAgoISO]);
    console.log('Старые записи удалены из базы.');
  } catch (error) {
    console.error('Ошибка при очистке старых записей:', error);
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
  const userForUpcomingPayment = userDates[upcomingPaymentDate]?.[0]?.name || 'Неизвестный пользователь';
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
        {/* <Button title='НАЖМИ' onPress={scheduleNot} /> */}
      </InfoBox>
      <InfoBox>
      <Text style={{textAlign: 'center'}}>Следующий платёж:</Text>
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
