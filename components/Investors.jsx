import * as SQLite from 'expo-sqlite';
import React, { useContext } from 'react'
import { View, Text, Button, Modal, StyleSheet, TextInput, Image,  TouchableOpacity, FlatList } from 'react-native'
import styled from 'styled-components/native';
import ImgUser from '../assets/investimg.png';

const Allpost = styled.View`
padding: 5px;
`;

const Post = styled.View`
height: 265px;
`;
const InfoBox = styled.View`
height: 290px;
border-top-width: 1px
`;
const InfoDev = styled.View`
  margin: 13px;
  border-width: 2px;
  height: 120px;
  border-radius: 12px;
  border-color: #3A4A7D;
  background-color: #f9f9f9; 
  padding: 10px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 3; 
`;

const DuptText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #4a4a4a; 
  margin-bottom: 5px; 
`;
const PayText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #4a4a4a; 

`;

const PaymentText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #4a4a4a; 
  margin-top: 5px; 
`;


const ButtonBox = styled.View`
padding: 5px
`;



const AddInvest = styled.View``

const CloseImg = styled.TouchableOpacity`
position: 'absolute';
bottom: 293px;
left: 110px;
`;
const PostFullName = styled.Text`
font-size: 18px;
padding: 1px;
padding-top: 10px;
`;
const PostDupt = styled.Text`
font-size: 16px;
`;
const PostPayment = styled.Text`
font-size: 16px;
`;
const PostDate = styled.Text`
font-size: 16px;
`;
const PostDatePay = styled.Text`
font-size: 16px;
`;

const PostImage = styled.Image`
width: 70px;
height: 75px;
border-radius: 10px;
margin-top: 20px;
`;
const PostView = styled.View`
border-bottom-width: 1px;
border-bottom-color: rgba(0, 0, 0, 0.1);
flex-direction: row;
padding-bottom: 10px;
`;



const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    height: 330
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',

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



export const Investors = ({navigation}) => {

  const { DateTime } = require("luxon");
  

  const [alldupt, setAllDupt] = React.useState('');
  const [allpayment, setAllPayment] = React.useState('');
  

  const [modalOpen, setModalOpen] = React.useState(false);
  const [invest, setInvest] = React.useState([]);


  const [name, setName] = React.useState('');
  const [dupt, setDupt] = React.useState('');
  const [procent,setProcent] = React.useState('');
  const [datedupt, setDateDupt] = React.useState('');
  const [datepay, setDatePay] = React.useState([]);
  const [paymentUser, setPaymentUser] = React.useState('');
  const [todayPayment, setTodayPayment] = React.useState('');

  const novosibirskTime = DateTime.now().setZone("Asia/Novosibirsk");
  const today = novosibirskTime.toISODate();
  const now = novosibirskTime.toLocaleString(DateTime.TIME_24_SIMPLE);

  const db = React.useRef(null);

  const initDb = async () => {
    try {
        if (!db.current) {
            // Открытие базы данных, если она ещё не инициализирована
            db.current = await SQLite.openDatabaseAsync('BDInvest1');
            console.log("Database initialized successfully");
        }
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

React.useEffect(() => {
  const fetchData = async () => {
    try {
        await initDb(); // Убедиться, что база данных инициализирована
        const usersData = await getInvest();
        setInvest(usersData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };
  fetchData();
  // Очистка ресурса при размонтировании компонента
  return () => {
      if (db.current) {
          db.current.closeAsync().catch(err => console.error("Error closing database:", err));
          db.current = null; // Сброс ссылки после закрытия
      }
  };


}, []);

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


  const addInvestors = async (event) => {

    const db = await SQLite.openDatabaseAsync('BDInvest1');
    event.persist();
    
    try {

      const payment = calculatePayment(dupt, procent)

      const nextPaymentDate = calculateNextPaymentDate(datedupt);

      await db.runAsync(
        'INSERT INTO BDInvest1 (name, dupt, payment, procent, datedupt, datepay) VALUES (?,?,?,?,?,?)',
         name, dupt, payment, procent, datedupt, nextPaymentDate)
         console.log("Пользак добавлен")

         navigation.goBack();

     

    } catch (error) {
      console.log("Ошибка при добавлении инвестора", error)
      
    }

  }

  const getInvest = async () => {
    if (!db.current) {
        console.error('Database connection is not initialized');
        await initDb(); // Переоткрываем базу данных
    }

    try {
        const result = await db.current.getAllAsync('SELECT * FROM BDInvest1');
        const usersArray = [];

        for (const row of result) {
            usersArray.push(row);
        }

        const alldupt = usersArray.map(row => row.dupt);
        const sumDupt = alldupt.reduce((acc, row) => acc + row, 0);
        const sortedUsers = usersArray.sort((a, b) => new Date(a.datepay) - new Date(b.datepay));
        const userForUpcomingPayment = sortedUsers[0]?.name || 'Неизвестный пользователь';
        const paymentUser = sortedUsers[0]?.payment;
        const paymentDates = sortedUsers[0]?.datepay || null;

        setTodayPayment(paymentUser);
        setDatePay(paymentDates);
        setAllDupt(sumDupt);
        setPaymentUser(userForUpcomingPayment);

        const allpayment = usersArray.map(row => row.payment);
        const sumpayment = allpayment.reduce((acc, row) => acc + row, 0);
        setAllPayment(sumpayment);

        return usersArray;
    } catch (error) {
        console.error("Error getting users:", error);
        throw error;
    }
};




// console.log(paymentUser)
// console.log(datepay)
// console.log(todayPayment)



const renderItem = React.useCallback(({ item }) => (
  <TouchableOpacity onPress={() => navigation.navigate('FullPostInvest', {id: item.id, name: item.name, dupt: item.dupt, payment: item.payment, procent: item.procent, datedupt: item.datedupt, datepay: item.datepay })}>
      <PostView>
          <PostImage source={ImgUser} resizeMode="contain" />
          <View>
              <PostFullName>{item.name}</PostFullName>
              <PostDupt>Сумма: {item.dupt}</PostDupt>
              <PostPayment>Платёж: {item.payment}</PostPayment>
              <PostDate>Дата займа: {item.datedupt}</PostDate>
              <PostDatePay>Дата платежа: {item.datepay}</PostDatePay>
          </View>
      </PostView>
  </TouchableOpacity>
), [navigation]);




    return <React.Fragment>
    <Post>
         <FlatList
            data={invest}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            getItemLayout={(data, index) => (
                {length: 100, offset: 100 * index, index} 
          )}/>
         

        <Modal visible={modalOpen}
         transparent={true} 
         onRequestClose={() => setModalOpen(false)}>
          
          <AddInvest style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>
            Добавить инвестора
            </Text>
            <TextInput 
            style={styles.input} 
            placeholder='ФИО'
            value={name}
            onChangeText={setName}  />

            <TextInput
            style={styles.input}
            placeholder='Сумма'
            keyboardType='numeric'
            value={dupt}
            onChangeText={setDupt} />

            <TextInput 
            style={styles.input}
            placeholder='Ставка'
            keyboardType='numeric'
            value={procent}
            onChangeText={setProcent} />

            <TextInput 
            style={styles.input} 
            placeholder='Дата займа'
            keyboardType='numeric'
            value={datedupt}
            onChangeText={setDateDupt} />
            <Button title='Добавить' color="#007AFF" onPress={addInvestors} />

            <CloseImg onPress={() => setModalOpen(false)} > 
              <Image source={require('../assets/close.png')} style={{width: 14, height: 14}} />
          
                     
              </CloseImg>
            </View>
            

         

          </AddInvest>


        </Modal>





    </Post>
    <InfoBox>
     <InfoDev> 
      <Text style={{textAlign: 'center', paddingBottom: 5, fontSize: 15}}>Общая информация:</Text>
      <DuptText>Сумма долга: {alldupt} руб. </DuptText>
      <PaymentText>Сумма платежей: {allpayment} руб. </PaymentText>
     </InfoDev>
     <InfoDev >
     <Text style={{textAlign: 'center', paddingBottom: 5, fontSize: 15}}>Предстоящий платёж:</Text>
     <PayText style={{textAlign: 'center'}}>{paymentUser}</PayText>
     <PayText style={{textAlign: 'center'}}>{datepay}</PayText>
     <PayText style={{textAlign: 'center'}}>{todayPayment} руб.</PayText>
     </InfoDev>
    </InfoBox>

    <ButtonBox>
    <Button title='Добавить инвестора' color="#007AFF" onPress={() => setModalOpen(true)} />
    </ButtonBox>
   

        
   </React.Fragment >
} 


