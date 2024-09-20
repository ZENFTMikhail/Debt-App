import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, ScrollView, TextInput, Modal, Alert, PermissionsAndroid } from 'react-native';
import styled from 'styled-components/native';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';










export const FullPost = ({ route }) => {
  const { id, name, dupt, payment, procent, phone, datedupt, datepay, collateral } = route.params;
  const navigation = useNavigation();

  // Состояния для модального окна и данных
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [pay, setPay] = React.useState(''); // Сумма внесения
  const [days, setDays] = React.useState(''); // Количество дней
  const [paymentDate, setPaymentDate] = React.useState('');
  const [newDupt, setNewDupt] = React.useState(dupt);
  const [newPayment, setNewPayment] = React.useState(payment);

  React.useEffect(() => {
    console.log(route.params);
  }, []);


  const calculateNextPaymentDate = (startDate) => {
    const date = new Date(startDate);
    const day = date.getDate();
    date.setMonth(date.getMonth() + 1);
    if (date.getDate() !== day) {
      date.setDate(0);  
    }
    return date.toISOString().split('T')[0];  
  };


  const recalculation = async (pay, days, paymentDate) => {
    const db = await SQLite.openDatabaseAsync('BD3');
  
    // Преобразование строк в числа
    pay = parseFloat(pay);
    days = parseInt(days);
  
    if (isNaN(pay) || isNaN(days)) {
      alert('Некорректные значения pay или days');
      return;
    }
  
    const dayprocent = procent / 30;
    const procentDayresult = dayprocent * days;
    const paymentinallDay = (procentDayresult * dupt) / 100;
    const result = (dupt + paymentinallDay) - pay;
    const newPaymentcalc = (result * procent) / 100;
    const roundedResult = Math.round(result);
    const newPayment = Math.round(newPaymentcalc);
  
    // Рассчитываем следующую дату платежа
    const nextPaymentDate = calculateNextPaymentDate(paymentDate);
  
    try {
      // Обновляем dupt, payment, дату займа и дату следующего платежа в базе данных
      await db.runAsync('UPDATE BD3 SET dupt = ?, payment = ?, datedupt = ?, datepay = ? WHERE id = ?', 
        [roundedResult, newPayment, paymentDate, nextPaymentDate, id]);
      console.log('Обновленные значения dupt, payment, datedupt, datepay:', roundedResult, newPayment, paymentDate, nextPaymentDate);
  
      navigation.goBack(); // Возврат на предыдущий экран
    } catch (error) {
      console.error('Ошибка при обновлении базы данных:', error);
    }
  
    return result;
  };

  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
            }
            h1, h2 {
              text-align: center;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            .bold {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <h1>Договор займа (обеспечение - залог транспортного средства)</h1>
          <h2>Барнаул</h2>
          <h2>«__»___________20___</h2>
  
          <div class="section">
            _______________________________________________________, _________________ г.р., место рождения: ___________________________,
            паспорт: серия _____ номер ______, выдан ________________________________________________________, дата выдачи: _________ г. 
            код подразделения _______________, адрес регистрации: ___________________________________________________, именуемый в дальнейшем "Заимодавец", с одной стороны и
          </div>
  
          <div class="section">
            _______________________________________________________, _________________ г.р., место рождения: ___________________________,
            паспорт: серия _____ номер ______, выдан ________________________________________________________, дата выдачи: _________ г. 
            код подразделения_______________, адрес регистрации: ___________________________________________________, именуемый в дальнейшем "Заемщик", с другой стороны, 
            а вместе именуемые "Стороны", заключили настоящий договор о нижеследующем:
          </div>
  
          <div class="section">
            <span class="bold">1. Предмет договора</span><br>
            1.1. По настоящему договору Заимодавец передает в собственность Заемщику денежные средства в размере___________________________ (_______________________________________________) рублей,
            а Заемщик обязуется возвратить Заимодавцу такую же сумму денег (далее по тексту - заем) в обусловленный настоящим договором срок.<br>
            1.2. Заем предоставляется на срок до ____________________.<br>
            1.3. Заем по настоящему договору не является целевым.
          </div>
  
          <div class="section">
            <span class="bold">2. Порядок возврата займа</span><br>
            2.1. Заемщик обязуется возвратить сумму займа не позднее «___»_________ 20___ г. в следующем порядке: __________________________.
          </div>
        </body>
      </html>
    `;
  
    let options = {
      html: htmlContent,
      fileName: 'dogovor_zaima',
      directory: 'Documents',
      width: 595,  // ширина A4
      height: 842, // высота A4
    };
  
    let file = await RNHTMLtoPDF.convert(options);
    console.log(file.filePath);

    
const source = file.filePath;
const destination = `${RNFS.DownloadDirectoryPath}/dogovor_zaima.pdf`;

try {
  await RNFS.moveFile(source, destination);
  console.log('File moved to:', destination);
} catch (err) {
  console.log('Error moving file:', err);
}
  };

  

  const deleteUser = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('BD3');
      const result = await db.getAllAsync('DELETE FROM BD3 WHERE id = ?', [id]);

      if (result) {
        console.log('User successfully deleted:', result);
        navigation.goBack(); // Возвращаемся на предыдущий экран
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const imageUris = collateral ? collateral.split(',') : [];

  
 
 

  

  return (
    <GradientContainer>
      <ContentContainer>
        <StyledText>ФИО: {name}</StyledText>
        <StyledText>Сумма: {dupt}</StyledText>
        <StyledText>Платёж: {newPayment}</StyledText>
        <StyledText>Ставка: {procent}%</StyledText>
        <StyledText>Телефон: {phone}</StyledText>
        <StyledText>Дата займа: {datedupt}</StyledText>
        <StyledText>Дата платежа: {datepay}</StyledText>
        <ScrollView horizontal>
          {imageUris.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 150, height: 150, margin: 5 }} />
          ))}
        </ScrollView>
        <View style={{paddingBottom: 10, paddingTop: 5}}>
        <Button title="Перерасчет" onPress={() => setModalVisible(true)} />
         </View>   
        <Button title="Удалить пользователя" onPress={deleteUser} />
        <View  style={{paddingBottom: 10, paddingTop: 10}}>
      <Button title="Сохранить договор в PDF"  onPress={generatePDF}/>
      </View>

        {/* Модальное окно для перерасчета */}
        <Modal visible={isModalVisible} transparent={true}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={pay}
        onChangeText={setPay}
        placeholder="Сумма платежа"
      />
      
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={days}
        onChangeText={setDays}
        placeholder="Количество дней"
      />
      
      <TextInput
        style={styles.input}
        value={paymentDate}
        onChangeText={setPaymentDate}
        placeholder="Дата платежа(гггг-мм-дд)"
      />
      <View style={{paddingBottom: 5}}>
      <Button title="Рассчитать" onPress={() => recalculation(pay, days, paymentDate)} />
        </View>
      <Button title="Отмена" onPress={() => setModalVisible(false)} />
    </View>
    
  </View>
</Modal>
      </ContentContainer>
    </GradientContainer>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    borderBottomWidth: 1,
    width: '100%',
    padding: 5,
    marginVertical: 10,
  },
});


const GradientContainer = styled(LinearGradient).attrs({
    colors: ['#e0f7fa', '#80deea', '#4dd0e1', '#00bcd4', '#0097a7'],
    start: { x: 10, y: 10 },
    end: { x: 1, y: 1 },
})`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const ContentContainer = styled.View`
    background-color: rgba(255, 255, 255, 0.8);
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    width: 90%;
`;

const StyledText = styled.Text`
    font-size: 17px;
    color: #333;
    margin-bottom: 10px;

`;