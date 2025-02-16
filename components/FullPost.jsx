import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, ScrollView, TextInput, Modal, Alert, PermissionsAndroid } from 'react-native';
import styled from 'styled-components/native';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AgreementDate } from './AgreementDate';
import { LoadDateContext } from './LoadDateContext';
import CustomButton from './CustomButton';










export const FullPost = ({ route }) => {
  const { id, name, dupt, payment, procent, procentInvest, nameInvest, phone, datedupt, datepay, collateral } = route.params;
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
  const [paymentInvest, setPaymentInvest] = React.useState('');
  const [mycash, setMyCash] = React.useState('');




  React.useEffect(() => {
    
    const payInv = (dupt / 100) * procentInvest;
    setPaymentInvest(payInv);
    const myprocent = procent - procentInvest;

    const cash = (dupt / 100) * myprocent;
    setMyCash(cash);


  },[])

  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Добавляем ведущий ноль
    const day = String(date.getDate()).padStart(2, '0'); // Добавляем ведущий ноль
    return `${year}-${month}-${day}`;
};
  

const calculateNextPaymentDate = (startDate) => {
  const date = new Date(startDate);
  const day = date.getDate();

  // Увеличиваем месяц
  date.setMonth(date.getMonth() + 1);

  // Если день изменился из-за перехода месяца, корректируем на последний день месяца
  if (date.getDate() !== day) {
      date.setDate(0);
  }

  // Форматируем дату в локальном формате
  return formatDateToYYYYMMDD(date);
};

  const recalculation = async (pay) => {
    const db = await SQLite.openDatabaseAsync('BDuser3');
    const investDb = await SQLite.openDatabaseAsync('BDInvest1');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Устанавливаем время на начало дня
    const todayDateStr = formatDateToYYYYMMDD(today)


    
    const startDate = new Date(datedupt);
    startDate.setHours(0, 0, 0, 0); // Устанавливаем время на начало дня
    
    // Вычисляем количество дней
    const days = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
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
    let remainingDebt = totalWithInterest - pay;
    console.log('Remaining debt after payment:', remainingDebt);


   
    // Рассчитываем следующую дату платежа
    const nextPaymentDate = calculateNextPaymentDate(todayDateStr);

    if (nameInvest !== '') {
    const diferenceProcentInvest = procentInvest / daysIsMonth; // процент в день инвестора
    const diferenceProcentClient = procent / daysIsMonth;  // процент в день клиента 

    const readyProcentSumInvest = ((diferenceProcentInvest * days) * dupt) / 100; // сумма набежавших процентов за кол дней инвест
    const readyProcentSumIvan = ((diferenceProcentClient * days) * dupt) /100;  // сумма набежавших прцоентов за кол дней клиент

    const togeverDuptWithProcent = dupt + readyProcentSumInvest;  // основной долг + проценты инвестора 

    const cashIvan = (readyProcentSumIvan + dupt) - togeverDuptWithProcent;  // деньги заработанные 
   
    const newDupt = togeverDuptWithProcent - pay + cashIvan; 
    const newPayment = (newDupt * procentInvest) / 100;


    try { 

      await investDb.runAsync(
        'UPDATE BDInvest1 SET dupt = ?, payment = ?, datedupt = ?, datepay = ? WHERE name = ?',
        [Math.round(newDupt), Math.round(newPayment), todayDateStr, nextPaymentDate, nameInvest ]

      )

      alert(`Ваш доход составил ${Math.round(cashIvan)} руб.`)
      
    } catch (error) {
      console.log('Ошибка при обновлении данных инвестора')
    }
    }




    const roundedRemainingDebt = Math.round(remainingDebt);
    const newPaymentCalc = (roundedRemainingDebt * procent) / 100; // Новый ежемесячный платёж
    const roundedNewPayment = Math.round(newPaymentCalc);
    
    try {
        // Обновляем данные в базе
        await db.runAsync(
            'UPDATE BDuser3 SET dupt = ?, payment = ?, datedupt = ?, datepay = ? WHERE id = ?',
            [roundedRemainingDebt, roundedNewPayment, todayDateStr, nextPaymentDate, id]
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
        const db = await SQLite.openDatabaseAsync('BDuser3');
      const result = await db.getAllAsync('DELETE FROM BDuser3 WHERE id = ?', [id]);
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
        <StyledText>Платеж: {newPayment}</StyledText>
        <StyledText>Инвестор: {nameInvest} </StyledText>
        <StyledText>Платеж инвестору: {Math.round(paymentInvest)}</StyledText>
        <StyledText>Мои средства: {Math.round(mycash)} </StyledText>
        <StyledText>Ставка клиента: {procent}%</StyledText>
        <StyledText>Ставка инвестора: {procentInvest}%</StyledText>
        <StyledText>Телефон: {phone}</StyledText>
        <StyledText>Дата займа: {datedupt}</StyledText>
        <StyledText>Дата платежа: {datepay}</StyledText>
        <ScrollView horizontal>
          {imageUris.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 150, height: 150, margin: 5 }} />
          ))}
          
        </ScrollView>
        
        <View style={{paddingBottom: 2, paddingTop: 5}}>
        <CustomButton title={'Внести платеж'} onPress={() => setModalVisible(true)}></CustomButton>
        
         </View>   
        <View  style={{paddingBottom: 2, paddingTop: 10}}>
        <CustomButton title={'Внести данные в договор'} onPress={() => setModalVisibleagreement(true)}></CustomButton>
      </View>
      <View  style={{paddingBottom: 5, paddingTop: 10}}>
      <CustomButton title={'Удалить пользователя'} onPress={() => setDeleteuserV(true)}></CustomButton>
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
            <CustomButton title={'Да'} onPress={deleteUser}></CustomButton>
          
          </View>
           <View style={styles.buttonWrapper}>
            <CustomButton title={'Нет'} onPress={() => setDeleteuserV(false)} ></CustomButton>
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
        <CustomButton title={'Рассчитать'} onPress={() => recalculation(pay)}></CustomButton>
        </View>
        <CustomButton title={'Отмена'} onPress={() => setModalVisible(false)} ></CustomButton>
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
    font-size: 16px;
    color: #333;
    margin-bottom: 2px;
    margin-left: 7px;
`;

