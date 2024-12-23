
import { Navigation } from "./components/Navigation";
import { registerRootComponent } from 'expo';
import * as SQLite from 'expo-sqlite';
import React from 'react';



registerRootComponent(App);

const initDataSms = async () => {
  const db = await SQLite.openDatabaseAsync('dataSMS');

  try {

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS dataSMS (
      id INTEGER PRIMARY KEY NOT NULL,
      status TEXT NOT NULL,
      name TEXT NOT NULL,
      date INTEGER 
      );
      `);
      console.log('База для sms создана')
    
  } catch (error) {
    console.log('Ошибка при создании базы', error);
    
  }

}

const initDateBaseNote = async () => {
  const db = await SQLite.openDatabaseAsync('Note')

  try {

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS Note (
      id INTEGER PRIMARY KEY NOT NULL,
      noteText TEXT NOT NULL
      );
      `);

      console.log('Create BDNote complete')

  } catch (error) {
    console.log('Create DB error', error)
  }
}

const initDbInvest = async () => {
  const db = await SQLite.openDatabaseAsync('BDInvest1');

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS BDInvest1 (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      dupt INTEGER,
      payment INTEGER,
      procent INTEGER,
      datedupt INTEGER, 
      datepay INTEGER

      );
      `); 

      console.log("Created BDInvest1")
  } catch (error) {

  }
};

const initDb = async () => {
  const db = await SQLite.openDatabaseAsync('BD3');
  
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS BD3 (
        id INTEGER PRIMARY KEY NOT NULL, 
        name TEXT NOT NULL, 
        dupt INTEGER, 
        payment INTEGER, 
        procent INTEGER, 
        phone INTEGER, 
        datedupt INTEGER, 
        datepay INTEGER,
        collateral TEXT
      );
    `);

    console.log('Created BD3 (if not exists)');
    
  } catch (error) {
    console.log(error);
  }
};

initDb();
initDbInvest();
initDateBaseNote();
initDataSms();







export default function App() {


  return <Navigation />


}