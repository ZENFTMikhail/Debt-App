import React, { createContext, useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

export const LoadDateContext = createContext();

export const LoadDateProvider = ({ children }) => {
  const [loadDate, setLoadDate] = React.useState([]);
  const [AllCredit, setAllCredit] = React.useState('');
  const [paymentDates, setPaymentDates] = React.useState([]); 
  const [Allpayment, setAllPayment] = React.useState([]);
  const [userDates, setUserDates] = React.useState({}); // Объект, где каждая дата хранит массив имён

  
    const fetchData = async () => {
      const db = await SQLite.openDatabaseAsync('BD3');
      
      try {
        // Извлекаем данные с датами и именами пользователей
        const result = await db.getAllAsync('SELECT datedupt, datepay, name FROM BD3');
        
        if (result.length > 0) {
          const loanDates = result.map(row => row.datedupt);
          const payDates = result.map(row => row.datepay);

          // Создаём объект, где ключом является дата, а значением — массив имён пользователей
          const userDateMap = result.reduce((acc, row) => {
            const { datepay, name } = row;
            
            // Если дата уже существует, добавляем имя в массив
            if (acc[datepay]) {
              acc[datepay].push(name);
            } else {
              // Иначе создаём новый массив для этой даты
              acc[datepay] = [name];
            }
            return acc;
          }, {});

          setUserDates(userDateMap);  // Сохраняем объект с датами и массивами имён
          setLoadDate(loanDates);  
          setPaymentDates(payDates); 
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных из базы:', error);
      }
    };

  
  

  
    const getAllCredit = async () => {
      try {
        const db = await SQLite.openDatabaseAsync('BD3');
        const result = await db.getAllAsync('SELECT dupt, payment FROM BD3');

        if (result.length > 0) {
          const totalCredit = result
            .map(row => parseFloat(row.dupt) || 0)
            .reduce((sum, current) => sum + current, 0);  

          const paymentAll = result
            .map(row => parseFloat(row.payment) || 0)
            .reduce((sum, current) => sum + current, 0);

          setAllPayment(paymentAll);
          setAllCredit(totalCredit);

          console.log('Общая сумма кредитов:', totalCredit);
          console.log('Общая сумма платежей:', paymentAll);
        } else {
          alert('Нет данных для сложения');
        }
      } catch (error) {
       alert('Ошибка при извлечении данных:', error);
      }
    };
    
    React.useEffect(() =>{
      fetchData();
      getAllCredit();


    },[])
  

  return (
    <LoadDateContext.Provider value={{ loadDate, paymentDates, fetchData, setLoadDate, Allpayment, getAllCredit, userDates, AllCredit }}>
      {children}
    </LoadDateContext.Provider>
  );
};