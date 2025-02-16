import React, { createContext, useContext, useEffect, useRef } from 'react';
import * as SQLite from 'expo-sqlite';

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
    const dbRefs = useRef({
        BDInvest1: null,
        BDuser3: null,
        Note: null, // Добавьте другие базы данных по необходимости
    });

    const initDb = async (dbName) => {
        if (!dbRefs.current[dbName]) {
            dbRefs.current[dbName] = SQLite.openDatabaseAsync(dbName);
            console.log(`Database ${dbName} initialized`);
        }
        return dbRefs.current[dbName];
    };

    const closeDb = async (dbName) => {
        const db = dbRefs.current[dbName];
        if (db) {
            try {
                // Здесь нет метода closeAsync, поэтому просто сбрасываем ссылку
                dbRefs.current[dbName] = null;
                console.log(`Database ${dbName} reference cleared`);
            } catch (error) {
                console.error(`Error clearing database reference ${dbName}:`, error);
            }
        }
    };

    const closeAllDbs = async () => {
        for (const dbName in dbRefs.current) {
            await closeDb(dbName);
        }
    };  

    useEffect(() => {
        return () => {
            closeAllDbs().catch((err) => console.error("Error closing all databases:", err));
        };
    }, []);

    return (
        <DatabaseContext.Provider value={{ initDb, closeDb }}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => useContext(DatabaseContext);
