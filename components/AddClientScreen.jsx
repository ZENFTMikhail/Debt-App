import React from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Image, Text, TouchableOpacity, Modal, FlatList  } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { LoadDateContext } from './LoadDateContext';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';





const db =  SQLite.openDatabaseAsync('BD3');


export const AddClientScreen = ({navigation}) => {
  const { setLoadDate, fetchData, getAllCredit } = React.useContext(LoadDateContext);
  const [images, setImages] = React.useState([]);  
  const [name, setName] = React.useState('');
  const [dupt, setDupt] = React.useState('');
  const [procent, setProcent] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [datedupt, setDateDupt] = React.useState('');

  const [contacts, setContacts] = React.useState([]);
  const [filteredContacts, setFilteredContacts] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [search, setSearch] = React.useState('');


  
  const formatPhoneNumber = (phoneNumber) => {
    // Убираем все нечисловые символы
    let cleanedNumber = phoneNumber.replace(/\D/g, '');

    // Если номер начинается с 8, заменяем на 7
    if (cleanedNumber.startsWith('8')) {
      cleanedNumber = '7' + cleanedNumber.slice(1);
    }

    return cleanedNumber;
  };




  React.useEffect(() => {
    if (modalVisible) {
      fetchContacts(); // Загружаем контакты, когда открываем модальное окно
    }
  }, [modalVisible]);

  const fetchContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      setContacts(data);
      setFilteredContacts(data); // По умолчанию показываем все контакты
    }
  };


  const handleSearch = (text) => {
    setSearch(text);
    const filtered = contacts.filter(contact => {
      const contactName = contact.name.toLowerCase();
      return contactName.includes(text.toLowerCase());
    });
    setFilteredContacts(filtered);
  };

  const handleContactSelect = (contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      const formattedPhone = formatPhoneNumber(contact.phoneNumbers[0].number)
      setPhone(formattedPhone); // Берем первый номер
    }
    setModalVisible(false); // Закрываем модальное окно после выбора контакта
  };



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
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Телефон"
          value={phone}
          onChangeText={setPhone}
          
        />
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconContainer}>
          <Image
            source={require('../assets/contact-icon.png')} // Замени на путь к иконке
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
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
      

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Поиск контакта"
            value={search}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.contactItem} onPress={() => handleContactSelect(item)}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Закрыть" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
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
  inputContainer: {
    flexDirection: 'row', // Размещаем TextInput и кнопку в одном ряду
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    height: 40,
    marginBottom: 10,
    paddingLeft: 7

 
   
  },
  iconContainer: {
    position: 'absolute',
    left: 280 // Отступ слева от края TextInput
  },
  icon: {
    width: 24, // Размер иконки
    height: 24,
  },
  
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
  contactItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  
  view: {
    paddingTop: 20
  }
});