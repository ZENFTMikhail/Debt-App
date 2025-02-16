import React, { useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Button, Modal, StyleSheet, Text, TextInput } from 'react-native';
import * as SQLite from 'expo-sqlite';
import CustomButton from './CustomButton';




export const FullPostInvest = ({route}) => {

    const [deleteuserV, setDeleteuserV] = React.useState(false);
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [pay, setPay] = React.useState('');

    const { id, name, dupt, payment, procent, datedupt, datepay } = route.params;
    const navigation = useNavigation();


    const deleteInvestor = async () => {
        try { const db = await SQLite.openDatabaseAsync('BDInvest1');
            const result = await db.getAllAsync('DELETE FROM BDInvest1 WHERE id = ?', [id]);
              if (result) {
                console.log('User successfully deleted:', result);
                navigation.goBack();
              }
        } catch (error) {
            console.log('Error delete user', error)
        }
    }

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
        const db = await SQLite.openDatabaseAsync('BDInvest1');
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayDateStr = formatDateToYYYYMMDD(today);
       
       
       
    
        const startDate = new Date(datedupt);
        startDate.setHours(0,0,0,0);
        const days = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)); // Сколько дней прошло
        
    
        pay = parseFloat(pay);
        if (isNaN(pay)) {
            
            return;
        }
    
        const daysIsMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); // Дней в текущем месяце
      
    
        const dayprocent = procent / daysIsMonth; // Процент в день
        
    
        let updatedDebt = dupt; // Изначальный долг
        let interestForDays = 0;
    
        if (days > daysIsMonth) {
            // Если прошло больше 30/31 дня, добавляем платёж как часть долга и пересчитываем
            updatedDebt += (dupt * procent / 100); // Сумма долга с процентами за предыдущий месяц
            interestForDays = (updatedDebt * dayprocent * (days - daysIsMonth)) / 100; // Проценты за просроченные дни
            
        } else {
            // Процент за прошедшие дни в пределах месяца
            interestForDays = (updatedDebt * dayprocent * days) / 100;
        } 
    
        const totalWithInterest = updatedDebt + interestForDays; // Новый долг с учётом процентов
        
    
        // Учитываем оплату и рассчитываем оставшийся долг
        const remainingDebt = totalWithInterest - pay;
        
    
        // Рассчитываем новый платёж на основе оставшегося долга
        const newPaymentCalc = (remainingDebt * procent) / 100; // Новый ежемесячный платёж
        const roundedRemainingDebt = Math.round(remainingDebt);
        const roundedNewPayment = Math.round(newPaymentCalc);
    
        // Рассчитываем следующую дату платежа
        const nextPaymentDate = calculateNextPaymentDate(todayDateStr);
    
        try {
            // Обновляем данные в базе
            await db.runAsync(
                'UPDATE BDInvest1 SET dupt = ?, payment = ?, datedupt = ?, datepay = ? WHERE id = ?',
                [roundedRemainingDebt, roundedNewPayment, todayDateStr, nextPaymentDate, id]
            );
        
            navigation.goBack();
        } catch (error) {
            console.error('Ошибка при обновлении базы данных:', error);
        }
    
        return roundedRemainingDebt; // Возвращаем новый долг
    };

    



    return ( <>
        <GradientContainer>
        <ContentContainer>
         <StyledText>ФИО: {name}</StyledText>
        <StyledText>Сумма: {dupt}</StyledText>
        <StyledText>Платёж: {payment}</StyledText>
        <StyledText>Ставка: {procent}%</StyledText>
        <StyledText>Дата займа: {datedupt}</StyledText>
        <StyledText>Дата платежа: {datepay}</StyledText>
        <View style={{paddingBottom: 10}}>
          <CustomButton title='Внести платеж' onPress={() => setModalVisible(true)} />
        </View>
        <View>
          <CustomButton title='Удалить инвестора' onPress={() => setDeleteuserV(true)} />
        </View>   

        </ContentContainer>
       
        </GradientContainer>

        <Modal visible={deleteuserV} transparent={true}>
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
        <Text>
            Вы желаете удалить пользователя?
        </Text>

        <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <CustomButton title='Да' onPress={deleteInvestor} />
        </View>
            <View style={styles.buttonWrapper}>
              <CustomButton title='Нет' onPress={() => setDeleteuserV(false)} />
            </View>
            </View>
            </View>
        </View>
        </Modal>


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
        <CustomButton title="Рассчитать" onPress={() => recalculation(pay)}  ></CustomButton>
        </View>
        <CustomButton title=" Отмена " onPress={() => setModalVisible(false)} ></CustomButton>
         </View>
    
        </View>
         </Modal>
     </>)
}

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
    
    background-color: rgba(255, 255, 255, 0.8);
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