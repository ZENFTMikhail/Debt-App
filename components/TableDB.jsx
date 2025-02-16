import React, {useState, useEffect, useRef } from 'react'
import { View, Text,Image, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import styled from 'styled-components/native';
import * as SQLite from 'expo-sqlite';
import ImgUser from '../assets/jpg.png';
import { useDatabase } from './DatabaseContext';





export const TableDB =  ({navigation}) => {


const [isLoading, setIsLoading] = React.useState(true)
const [users, setUsers] = React.useState([]);
const {initDb} = useDatabase();



  
  const getUsers = async (db) => {
    try {
        const result = await db.getAllAsync('SELECT * FROM BDuser3');
        const usersArray = [];

        for (const row of result) {
            usersArray.push(row);
        }

        return usersArray; // Возвращаем массив с данными
    } catch (error) {
        console.error("Error getting users:", error);
        throw error; // Прокидываем ошибку для обработки в вызывающем коде
    }
};


  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const db = await initDb('BDuser3');
        const usersData = await getUsers(db); // Получаем пользователей
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false); // Отключаем индикатор загрузки
      }
    };

    fetchData();
  }, [initDb]);

  const Update = async () => {
    
    const db = await initDb('BDuser3');
    const usersArray = await getUsers(db);
    
        setUsers(usersArray)
}







const styles = styled.View`
 background-color: 'white';


`
const PostFullName = styled.Text`
font-size: 18px;
padding: 1px;
padding-top: 10px;

`
const PostDupt = styled.Text`
font-size: 16px;
`
const PostPhone = styled.Text`
font-size: 16px;
`
const PostPayment = styled.Text`
font-size: 16px;
`
const PostImage = styled.Image`
width: 70px;
height: 75px;
border-radius: 10px;
margin-top: 10px;

`
const PostView = styled.View`
border-bottom-width: 1px;
border-bottom-color: rgba(0, 0, 0, 0.1);
flex-direction: row;
padding-bottom: 10px;
`

const renderItem = React.useCallback(({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('FullPost', {id: item.id, name: item.name, dupt: item.dupt, payment: item.payment, procent: item.procent, procentInvest: item.procentInvest, nameInvest: item.nameInvest, phone: item.phone, datedupt: item.datedupt, datepay: item.datepay, collateral: item.collateral })}>
        <PostView>
            <PostImage source={ImgUser} resizeMode="contain" />
            <View>
                <PostFullName>{item.name}</PostFullName>
                <PostDupt>Сумма: {item.dupt}</PostDupt>
                <PostPayment>Платёж: {item.payment}</PostPayment>
                <PostPhone>Тел: {item.phone}</PostPhone>
            </View>
        </PostView>
    </TouchableOpacity>
), [navigation]);

 
       
      
   

    return (
        <View>
              <FlatList
    data={users}
    renderItem={renderItem}
    keyExtractor={(item) => item.id.toString()}
    getItemLayout={(data, index) => (
        {length: 100, offset: 100 * index, index} // Установи точную высоту элемента
    )}
    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={Update} />}
/>
                
        </View>
    )
}
