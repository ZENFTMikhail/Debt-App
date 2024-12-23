import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, ScrollView, TextInput, Modal, Alert, PermissionsAndroid } from 'react-native';
import styled from 'styled-components/native';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AgreementDate } from './AgreementDate';
import { LoadDateContext } from './LoadDateContext';










export const FullPost = ({ route }) => {
  const { id, name, dupt, payment, procent, phone, datedupt, datepay, collateral } = route.params;
  const navigation = useNavigation();
  const {getAllCredit, fetchData} = useContext(LoadDateContext);

  // Состояния для модального окна и данных
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [isModalVisibleagreement,setModalVisibleagreement] = React.useState(false);
  const [deleteuserV, setDeleteuserV] = React.useState(false)
  

  const [pay, setPay] = React.useState(''); // Сумма внесения
  const [days, setDays] = React.useState(''); // Количество дней
  const [paymentDate, setPaymentDate] = React.useState('');
  const [newDupt, setNewDupt] = React.useState(dupt);
  const [newPayment, setNewPayment] = React.useState(payment);


  const calculateNextPaymentDate = (startDate) => {
    const date = new Date(startDate);
    const day = date.getDate();
    date.setMonth(date.getMonth() + 1);
    if (date.getDate() !== day) {
      date.setDate(0);  
    }
    return date.toISOString().split('T')[0];  
  };

  const recalculation = async (pay) => {
    const db = await SQLite.openDatabaseAsync('BD3');
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0];
    console.log(todayDateStr);

    const startDate = new Date(datedupt);
    const days = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)); // Сколько дней прошло
    console.log('Days since last payment:', days);

    pay = parseFloat(pay);
    if (isNaN(pay)) {
        alert('Некорректное значение оплаты (pay)');
        return;
    }

    const daysIsMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); // Дней в текущем месяце
    console.log('Days in current month:', daysIsMonth);

    const dayprocent = procent / daysIsMonth; // Процент в день
    console.log('Daily percentage rate:', dayprocent);

    let updatedDebt = dupt; // Изначальный долг
    let interestForDays = 0;

    if (days > daysIsMonth) {
        // Если прошло больше 30/31 дня, добавляем платёж как часть долга и пересчитываем
        updatedDebt += (dupt * procent / 100); // Сумма долга с процентами за предыдущий месяц
        interestForDays = (updatedDebt * dayprocent * (days - daysIsMonth)) / 100; // Проценты за просроченные дни
        console.log('Interest for overdue days:', interestForDays);
    } else {
        // Процент за прошедшие дни в пределах месяца
        interestForDays = (updatedDebt * dayprocent * days) / 100;
    } 

    const totalWithInterest = updatedDebt + interestForDays; // Новый долг с учётом процентов
    console.log('Total debt with interest:', totalWithInterest);

    // Учитываем оплату и рассчитываем оставшийся долг
    const remainingDebt = totalWithInterest - pay;
    console.log('Remaining debt after payment:', remainingDebt);

    // Рассчитываем новый платёж на основе оставшегося долга
    const newPaymentCalc = (remainingDebt * procent) / 100; // Новый ежемесячный платёж
    const roundedRemainingDebt = Math.round(remainingDebt);
    const roundedNewPayment = Math.round(newPaymentCalc);

    // Рассчитываем следующую дату платежа
    const nextPaymentDate = calculateNextPaymentDate(todayDateStr);

    try {
        // Обновляем данные в базе
        await db.runAsync(
            'UPDATE BD3 SET dupt = ?, payment = ?, datedupt = ?, datepay = ? WHERE id = ?',
            [roundedRemainingDebt, roundedNewPayment, todayDateStr, nextPaymentDate, id]
        );
        console.log(
            'Обновленные значения:',
            roundedRemainingDebt,
            roundedNewPayment,
            todayDateStr,
            nextPaymentDate
        );

        // Обновление данных и возврат на предыдущий экран
        await fetchData();
        await getAllCredit();
        navigation.goBack();
    } catch (error) {
        console.error('Ошибка при обновлении базы данных:', error);
    }

    return roundedRemainingDebt; // Возвращаем новый долг
};

  const deleteUser = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('BD3');
      const result = await db.getAllAsync('DELETE FROM BD3 WHERE id = ?', [id]);
      await fetchData();
      await getAllCredit();

      if (result) {
        console.log('User successfully deleted:', result);
        navigation.goBack(); // Возвращаемся на предыдущий экран
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };




  const imageUris = collateral ? collateral.split(',') : [];

  
 
 

  

  return (
    <GradientContainer>
      <ContentContainer>
        <StyledText>ФИО: {name}</StyledText>
        <StyledText>Сумма: {dupt}</StyledText>
        <StyledText>Платёж: {newPayment}</StyledText>
        <StyledText>Ставка: {procent}%</StyledText>
        <StyledText>Телефон: {phone}</StyledText>
        <StyledText>Дата займа: {datedupt}</StyledText>
        <StyledText>Дата платежа: {datepay}</StyledText>
        <ScrollView horizontal>
          {imageUris.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 150, height: 150, margin: 5 }} />
          ))}
          
        </ScrollView>
        <View style={{paddingBottom: 2, paddingTop: 5}}>
        <Button title="Внести платёж" color="#007AFF" onPress={() => setModalVisible(true)} />
         </View>   
        <View  style={{paddingBottom: 2, paddingTop: 10}}>
      <Button title="Внести данные в договор" color="#007AFF"  onPress={() => setModalVisibleagreement(true)}/>
      </View>
      <View  style={{paddingBottom: 5, paddingTop: 10}}>
      <Button title="Удалить пользователя" color="#007AFF" onPress={() => setDeleteuserV(true)} />
      </View>

           {/* Модальное окно удаления пользователя */}
      <Modal visible={deleteuserV} transparent={true}>
       <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
         <Text>
            Вы желаете удалить пользователя?
         </Text>
      
         <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
          <Button title='Да' color="#FF0000" onPress={deleteUser} />
          </View>
           <View style={styles.buttonWrapper}>
            <Button title='Нет' color="#007AFF" onPress={() => setDeleteuserV(false)} />
              </View>
             </View>
           </View>
        </View>
      </Modal>

          {/* Модальное окно для договора */}
          <AgreementDate
        visible={isModalVisibleagreement}
        onClose={() => setModalVisibleagreement(false)}
        name={name}
        procent={procent}
        dupt={dupt}
        datedupt={datedupt}
      />

        {/* Модальное окно для перерасчета */}
        <Modal visible={isModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
      
        <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={pay}
        onChangeText={setPay}
        placeholder="Сумма платежа"
        />
      
       <View style={{paddingBottom: 5}}>
        <Button title="Рассчитать" color="#007AFF" onPress={() => recalculation(pay)} />
        </View>
      <Button title=" Отмена " color="#007AFF" onPress={() => setModalVisible(false)} />
    </View>
    
    </View>
  </Modal>
      </ContentContainer>
    </GradientContainer>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    textAlign: 'center',
    width: '100%',
    padding: 5,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20, // отступ сверху
  },
  buttonWrapper: {
    flex: 1, // кнопки занимают равное пространство
    marginHorizontal: 5, // отступы между кнопками
  },
});


const GradientContainer = styled(LinearGradient).attrs({
    colors: ['#e0f7fa', '#80deea', '#4dd0e1', '#00bcd4', '#0097a7'],
    start: { x: 10, y: 10 },
    end: { x: 1, y: 1 },
})`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const ContentContainer = styled.View`
    background-color: rgba(255, 255, 255, 0.7);
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    width: 90%;
`;

const StyledText = styled.Text`
    font-size: 17px;
    color: #333;
    margin-bottom: 10px;

`;