
import { Navigation } from "./components/Navigation";
import { registerRootComponent } from 'expo';
import * as SQLite from 'expo-sqlite';
import React from 'react';
import { DatabaseProvider } from "./components/DatabaseContext";



registerRootComponent(App);



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
  const db = await SQLite.openDatabaseAsync('BDuser3');
  
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS BDuser3 (
        id INTEGER PRIMARY KEY NOT NULL, 
        name TEXT NOT NULL, 
        dupt INTEGER, 
        payment INTEGER, 
        procentInvest INTEGER,
        nameInvest INTEGER,
        procent INTEGER, 
        phone INTEGER, 
        datedupt INTEGER, 
        datepay INTEGER,
        collateral TEXT
      );
    `);

    console.log('Created BDuser3 (if not exists)');
    
  } catch (error) {
    console.log(error);
  }
};

initDb();
initDbInvest();
initDateBaseNote();








export default function App() {


  return <>
  <DatabaseProvider>
  <Navigation />
  </DatabaseProvider>
  </>


}
