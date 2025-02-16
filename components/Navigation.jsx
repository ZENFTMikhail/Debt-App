import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { FullPost } from './FullPost';
import { TableDB } from './TableDB';
import { Navbar } from './Navbar';
import { Home } from './Home';
import { AddClientScreen } from './AddClientScreen';
import { LoadingStart } from './LoadingStart';
import { Investors } from './Investors';
import 'react-native-gesture-handler';
import { LoadDateProvider } from './LoadDateContext';
import { FullPostInvest } from './FullPostInvest';
import { Notes } from './Notes';

const Stack = createNativeStackNavigator();

export const Navigation = () => {
    const [loading, setLoading] = React.useState(true);

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
            <StatusBar barStyle='dark-content' showHideTransition="fade" />
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name='Home' component={Home} options={{ title: 'Календарь платежей'}} />
                <Stack.Screen name='TableDB' component={TableDB} options={{ title: 'Пользователи'}} />
                <Stack.Screen name='FullPost' component={FullPost} options={{ title: 'Карточка клиента'}} />
                <Stack.Screen name='FullPostInvest' component={FullPostInvest} options={{ title: 'Данные инвестора'}} />
                <Stack.Screen name='AddClient' component={AddClientScreen} options={{ title: 'Добавить клиента'}} />
                <Stack.Screen name= 'Investors' component={Investors} options={{title: 'Мои инвесторы'}} />
                <Stack.Screen name= 'Note' component={Notes} options={{title: 'Заметки'}} />
            </Stack.Navigator> 
            <Navbar />
        </NavigationContainer>
        </LoadDateProvider>
    );
};