import React from 'react';
import { View, Text } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles';

export default function Controls({
  users, brojAktivnih, showActive, setShowActive,
  newUser, setNewUser, adding, handleBarcode, handleAddUser
}) {
  return (
    <>
      <View style={styles.stats}>
        <Text style={styles.statsText}>Ukupno: {users.length}</Text>
        <Text style={styles.statsText}>Aktivni: {brojAktivnih}</Text>
      </View>
      <View style={styles.filterRow}>
        <Button mode={showActive ? 'outlined' : 'contained'} onPress={() => setShowActive(false)}>Svi</Button>
        <Button mode={showActive ? 'contained' : 'outlined'} onPress={() => setShowActive(true)}>Aktivni</Button>
      </View>
      <View style={styles.form}>
        <Button icon="barcode-scan" mode="contained" onPress={handleBarcode}>Skeniraj Barcode</Button>
        <TextInput label="Korisničko ime" value={newUser.user} onChangeText={text => setNewUser({...newUser, user: text})} style={styles.input} />
        <TextInput label="Šifra" secureTextEntry value={newUser.pass} onChangeText={text => setNewUser({...newUser, pass: text})} style={styles.input} />
        <View style={styles.pickerWrap}>
          <Picker selectedValue={newUser.role} onValueChange={val => setNewUser({...newUser, role: val})}>
            <Picker.Item label="Korisnik" value="user" />
            <Picker.Item label="Admin" value="admin" />
          </Picker>
        </View>
        <Button mode="contained" loading={adding} onPress={handleAddUser} style={styles.addBtn}>Dodaj korisnika</Button>
      </View>
    </>
  );
}
