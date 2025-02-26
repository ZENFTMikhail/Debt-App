import React from 'react'
import { View, Text, FlatList,TouchableOpacity, Button } from 'react-native'
import styled from 'styled-components/native';
import * as SQLite from 'expo-sqlite';
import CustomButton from './CustomButton';
import { useDatabase } from './DatabaseContext';


const Block = styled.View`
padding: 10px;
`;
const Input = styled.TextInput`
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  font-size: 16px;
`;


const NoteItem = styled.View`
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  border: 1px solid #eee;
`;

const NoteText = styled.Text`
  font-size: 16px;
  color: #333;
`;

export const Notes = () => {

    const [textNote, setTextNote] = React.useState('');
    const [allNote, setAllNote] = React.useState([]);
    const { initDb } = useDatabase();

  
    
    
const getNotes = async (db) => {
  try { 
      const result = await db.getAllAsync('SELECT * FROM Note')
      const userNotes = [];

      for (row of result) {
          userNotes.push(row)
      }
      console.log(userNotes)
    
      return userNotes;

  } catch (error) {
      console.log('Ошибка получения Notes', error)
  }

}

  

const addNote = async (e) => {
  const db = await initDb('Note');
 e.persist();

  try {

      await db.runAsync(
          'INSERT INTO Note (noteText) VALUES (?) ', textNote)
          console.log('Запись добавлена')
          setTextNote('');
          updateNote();

          

  } catch (error) {
      console.log('Ошибка добавления заметки', error)
  }

}   

const deleteNote = async (id) => {

 
try {
  const db = await SQLite.openDatabaseAsync('Note');

  const del = await db.getAllAsync('DELETE FROM Note WHERE id = ?', [id]);
  if (del) {
    console.log('Заметка удалена')
  }
  updateNote();
  
} catch (error) {
  console.log('Ошибка удаления заметки', error)
  
}
}

const updateNote = async () => {
  const db = await initDb('Note');
const result = await getNotes(db)
const usersNote = [];

    for (const row of result) {
        usersNote.push(row);
        
        
    }

    setAllNote(usersNote)
}
 
React.useEffect(() => {

    const fetchData = async () => {
        
        try {
          const db =  await initDb('Note',  { useNewConnection: true});
           const userNotes =  await getNotes(db);
           setAllNote(userNotes);
           
        } catch (error) {
            console.log('Error getNotes', error)
        }
    
     }   

     fetchData();

     


},[initDb])

    
    
 const renderNote = ({ item }) => (
    <NoteItem>
      <NoteText>{item.noteText}</NoteText>
      <TouchableOpacity
        onPress={() => deleteNote(item.id)}
        style={{ marginTop: 10, alignSelf: 'flex-end' }}
      >
        <Text style={{ color: 'red' }}>Удалить</Text>
      </TouchableOpacity>
    </NoteItem>
  );
    
    
    
    
    return (
        <Block>
          <Input
            placeholder="Введите заметку..."
            value={textNote}
            onChangeText={setTextNote}
          />
        <CustomButton title={'Добавить'} onPress={addNote} ></CustomButton>
            
         
          <FlatList
            style={{height: 500, paddingTop: 5}}
            data={allNote}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNote}
            getItemLayout={(data, index) => (
                {length: 100, offset: 100 * index, index}  )}/>
        </Block>
      );
}