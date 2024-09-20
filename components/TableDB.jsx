import React, {useState, useEffect } from 'react'
import { View, Text,Image, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import styled from 'styled-components/native';
import * as SQLite from 'expo-sqlite';
import ImgUser from '../assets/jpg.png';




export const TableDB =  ({navigation}) => {

const [isLoading, setIsLoading] = React.useState(true)
const [users, setUsers] = React.useState([]);

    
  const getUsers = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('BD3');
        const result = await db.getAllAsync('SELECT * FROM BD3');
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
            const usersData = await getUsers();
            setUsers(usersData);
            setIsLoading(true)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    fetchData().finally(() => {
        setIsLoading(false)
    });
}, []);

const Update = async () => {
    const db = await SQLite.openDatabaseAsync('BD3')
    const result = await db.getAllAsync('SELECT * FROM BD3')
    const usersArray = [];

        for (const row of result) {
            usersArray.push(row);
            
            
        }

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

const renderItem = ({ item }) => (
    <View style={styles.item}>

        <TouchableOpacity onPress={() => navigation.navigate('FullPost', {id: item.id, name: item.name, dupt: item.dupt, payment: item.payment, procent: item.procent, phone: item.phone, datedupt: item.datedupt, datepay: item.datepay, collateral: item.collateral })}>
        <PostView>
         <PostImage source={ImgUser} resizeMode="contain"></PostImage>
         <View>
        <PostFullName style={styles.name}>{item.name}</PostFullName>
        <PostDupt style={styles.dupt}>Сумма: {item.dupt}</PostDupt>
        <PostPayment style={styles.payment}>Платёж: {item.payment}</PostPayment>
        <PostPhone style={styles.phone}>Тел: {item.phone}</PostPhone>
        </View>
        </PostView>
        </TouchableOpacity>
    </View>
);


 
       
      
    if (isLoading) {
        return (

             
            <View style={{padding: 10, flex: 1, alignItems: 'center', justifyContent: 'center'}} >
              <ActivityIndicator size={'large'} />
              <Text> 
                Загрузка...
              </Text>
             
                
            </View>
        );
    };

    return (
        <View>
               <FlatList
               refreshControl={<RefreshControl refreshing={isLoading} onRefresh={Update} />}
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id} // Используем id как уникальный ключ
                />
                
        </View>
    )
}
