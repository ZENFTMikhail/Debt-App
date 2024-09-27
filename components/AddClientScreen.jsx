import React from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Image, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { LoadDateContext } from './LoadDateContext';
import * as ImagePicker from 'expo-image-picker';



const db =  SQLite.openDatabaseAsync('BD3');


export const AddClientScreen = ({navigation}) => {
  const { setLoadDate, fetchData, getAllCredit } = React.useContext(LoadDateContext);
  const [images, setImages] = React.useState([]);  
  const [name, setName] = React.useState('');
  const [dupt, setDupt] = React.useState('');
  const [procent, setProcent] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [datedupt, setDateDupt] = React.useState('');


  

  const calculatePayment = (dupt, procent) => {
    const payment = (dupt * procent) / 100;  
    return payment.toFixed(2);               
  };

  const calculateNextPaymentDate = (startDate) => {
    const date = new Date(startDate);
    const day = date.getDate();
    date.setMonth(date.getMonth() + 1);
    if (date.getDate() !== day) {
      date.setDate(0);  
    }
    return date.toISOString().split('T')[0];  
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access gallery is required!');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,  // Включаем множественный выбор
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map(asset => asset.uri);
        setImages(prevImages => [...prevImages, ...selectedImages]);  // Добавляем выбранные изображения
      }
    } catch (error) {
      console.error('Ошибка при выборе изображений:', error);
    }
  };

  const addClient = async (event) => {
    const db = await SQLite.openDatabaseAsync('BD3');
    event.persist();
  
    try {
      const payment = calculatePayment(dupt, procent);
      const nextPaymentDate = calculateNextPaymentDate(datedupt);
      
      const collateralValue = images.join(',');  // Сохраняем изображения как строку через запятую
      
      await db.runAsync(
        'INSERT INTO BD3 (name, dupt, payment, procent, phone, datedupt, datepay, collateral) VALUES (?,?,?,?,?,?,?,?)',
        name, dupt, payment, procent, phone, datedupt, nextPaymentDate, collateralValue
      );
      await fetchData();
      await getAllCredit();
  
      const result = await db.getAllAsync('SELECT datedupt, datepay FROM BD3');
      if (result.length > 0) {
        const dates = result.map(row => row.datedupt);
        setLoadDate(dates);  
      }
  
      navigation.goBack();
  
    } catch (error) {
      console.error('Ошибка при добавлении клиента:', error);
    }
  };

  
  return (
    <ScrollView style={styles.container}>
      <TextInput placeholder="ФИО" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Сумма" value={dupt} onChangeText={setDupt} style={styles.input} />
      <TextInput placeholder="Ставка" value={procent} onChangeText={setProcent} style={styles.input} />
      <TextInput placeholder="Телефон" value={phone} onChangeText={setPhone} style={styles.input} />
      <TextInput placeholder="Дата займа (гггг-мм-дд)" value={datedupt} onChangeText={setDateDupt} style={styles.input} />
      
      
      <Button title="Фото залога" onPress={pickImages} />
      
      <ScrollView horizontal>
        {images.map((imageUri, index) => (
          <Image key={index} source={{ uri: imageUri }} style={{ width: 150, height: 150, margin: 5 }} />
        ))}
      </ScrollView>
      <View style={{paddingTop: 10}}>
      <Button title="Добавить" onPress={addClient} />
      </View>
      
    </ScrollView>
  ); 
};



const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  
  view: {
    paddingTop: 20
  }
});