import React from 'react'
import { View, Text, Button } from 'react-native'

import styled from 'styled-components';



const InfoBox = styled.View`
padding: 10px;
border-width: 2px;
border-radius: 15px;
border-color: #3A4A7D;
height: 200px;
margin-bottom: 20px;
`
const Post = styled.View`
margin: 20px;

`



export const Investors = () => {

    return <>
    <Post>
    

         <InfoBox>
            <Text>
                
            </Text>
        </InfoBox>
        <Button title='Добавить инвестора'>
            
        </Button>
        </Post>
      </>
} 