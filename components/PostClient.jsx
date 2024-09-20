import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Image, View } from 'react-native';
import styled from 'styled-components/native';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useState } from 'react';





  

const PostView = styled.View`
flex-direction: row;
padding: 15px;
border-bottom-width: 1px;


 border-bottom-color: rgba(0, 0, 0, 0.1);

  padding-top: 20px;

border-bottom-style: solid;
 border-radius: 30px;
`

const PostDetails = styled.View`
padding: 20px;
`




const PostFullName = styled.Text`
font-size: 17px;
font-weight: 700;
text-color: gray;

`

const PostPhoneNumber = styled.Text`
font-size: 15px;
font-weight: 500;
`

const PostRegistration = styled.Text`
font-size: 15px;
font-weight: 500;
`

const PostImage = styled.Image`
width: 70px;
heigth: 70px;
border-radius: 10px;
  `

  const TextLoading = styled.View`
padding: 30px;
  `
 


  
  
  export const PostClient = ({ imageUrl,  }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [registration, setRegistration] = useState('');


    useEffect(() => {
      const fetchData = async () => {
        try {
          const db = await SQLite.openDatabaseAsync('databaseName');
          const result = await db.getAllAsync(
            'SELECT FullName, PhoneNumber, Registration FROM clients ORDER BY id DESC LIMIT 2', 
          );
          console.log(result)
          // setFullName(result.FullName)
          if (result.length > 0) {
            const { FullName, PhoneNumber, Registration } = result[0]; // Деструктуризация первого объекта массива
            setFullName(FullName); // Выведет 'Jon Fre'
            setPhoneNumber(PhoneNumber); // Выведет '323232'
            setRegistration(Registration); // Выведет '12.21'
           
        
          
          }
          
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }

        
      };
  
      fetchData();
    }, []);


    if (isLoading) {
      return (
        <TextLoading>
          <Text>Подгружаю базу...</Text>
        </TextLoading>
      );
    }
  
    return (
      <PostView>
        <PostImage source={{ uri: imageUrl }} />
        <PostDetails>
            <PostFullName>{fullName}</PostFullName>
            <PostPhoneNumber>{phoneNumber}</PostPhoneNumber>
            <PostRegistration>{registration}</PostRegistration>
            

        

       
      </PostDetails>
      </PostView>
    );
  };
  





