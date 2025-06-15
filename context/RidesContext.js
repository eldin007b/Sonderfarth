// context/RidesContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const RidesContext = createContext();

export function RidesProvider({ children }) {
  const [rides, setRides] = useState([]);

  // Učitaj sve vožnje iz AsyncStorage pri startu aplikacije
  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    const data = await AsyncStorage.getItem('rides');
    if (data) setRides(JSON.parse(data));
    else setRides([]);
  };

  // Dodaj novu vožnju i snimi u AsyncStorage
  const addRide = async (newRide) => {
    const updated = [newRide, ...rides];
    setRides(updated);
    await AsyncStorage.setItem('rides', JSON.stringify(updated));
  };

  // Obriši vožnju po ID-u
  const removeRide = async (id) => {
    const updated = rides.filter((r) => r.id !== id);
    setRides(updated);
    await AsyncStorage.setItem('rides', JSON.stringify(updated));
  };

  // Pozovi loadRides() kad god želiš osvježiti podatke (npr. kad drugi ekran promijeni vožnje)
  const updateRides = () => {
    loadRides();
  };

  return (
    <RidesContext.Provider value={{
      rides,
      addRide,
      removeRide,
      updateRides,
    }}>
      {children}
    </RidesContext.Provider>
  );
}
