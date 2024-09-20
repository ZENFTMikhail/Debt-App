
import { Navigation } from "./components/Navigation";


import * as SQLite from 'expo-sqlite';

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
}

initDb();




export default function App() {

  return <Navigation />


}