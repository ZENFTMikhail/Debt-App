import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { FullPost } from './FullPost';
import { TableDB } from './TableDB';
import { Navbar } from './Navbar';
import { Home } from './Home';
import { AddClientScreen } from './AddClientScreen';
import { LoadingStart } from './LoadingStart';
import 'react-native-gesture-handler';
import { LoadDateProvider } from './LoadDateContext';

const Stack = createNativeStackNavigator();

export const Navigation = () => {
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000); // 3 секунды

        return () => clearTimeout(timer); // Очистка таймера при размонтировании
    }, []);

    if (loading) {
        return   <LoadingStart />
     
    }

    return (
        <LoadDateProvider>
            <StatusBar barStyle="light-content" showHideTransition="fade" backgroundColor="#002366" />
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name='Home' component={Home} options={{ title: 'Календарь платежей'}} />
                <Stack.Screen name='TableDB' component={TableDB} options={{ title: 'Пользователи'}} />
                <Stack.Screen name='FullPost' component={FullPost} options={{ title: 'Карточка клиента'}} />
                <Stack.Screen name="AddClient" component={AddClientScreen} options={{ title: 'Добавить клиента'}} />
            </Stack.Navigator>
            <Navbar />
        </NavigationContainer>
        </LoadDateProvider>
    );
};