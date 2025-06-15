import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Modal, SafeAreaView } from 'react-native';
import { Provider, ActivityIndicator, Button, TextInput, Portal } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import Header from '../components/Header';
import Controls from '../components/Controls';
import UserCard from '../components/UserCard';
import { fetchUsersAPI, addUserAPI, deleteUserAPI, editUserAPI } from '../api/users';
import styles from '../styles';

export default function AdminPanel({ navigation }) {
  const [users, setUsers] = useState([]);
  const [showActive, setShowActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ user: '', pass: '', role: 'user' });
  const [adding, setAdding] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState({ original: '', user: '', pass: '', role: 'user' });
  const [beep, setBeep] = useState();
  const scrollRef = useRef();

  const brojAktivnih = users.filter(u => u.last_login).length;
  const displayedUsers = showActive ? users.filter(u => u.last_login) : users;

  useEffect(() => {
    loadUsers();
    Audio.Sound.createAsync(require('../assets/bip.mp3')).then(({ sound }) => setBeep(sound));
    return () => { beep && beep.unloadAsync(); };
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchUsersAPI();
    setUsers(data);
    setLoading(false);
    setRefreshing(false);
  };

  const playBeep = () => beep?.replayAsync().catch(() => {});

  const handleBarcodeAdd = ({ user, password }) => {
    if (!user || !password) return;
    playBeep();
    setNewUser({ user: user.trim(), pass: password.trim(), role: 'user' });
    setScannerVisible(false);
  };

  const handleAddUser = async () => {
    if (!newUser.user || !newUser.pass) return;
    setAdding(true);
    await addUserAPI(newUser);
    await loadUsers();
    setAdding(false);
    setNewUser({ user: '', pass: '', role: 'user' });
  };

  const handleDeleteUser = async () => {
    await deleteUserAPI(selectedUser.user);
    await loadUsers();
    setModalDelete(false);
  };

  const handleEditUser = async () => {
    await editUserAPI(editUser.original, { user: editUser.user, pass: editUser.pass, role: editUser.role });
    await loadUsers();
    setModalEdit(false);
  };

  const openDeleteModal = item => { setSelectedUser(item); setModalDelete(true); };
  const openEditModal = item => {
    setEditUser({ original: item.user, user: item.user, pass: item.pass || '', role: item.role });
    setModalEdit(true);
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator animating /></View>;

  return (
    <Provider>
      <SafeAreaView style={styles.safe}>
        <Header navigation={navigation} title="Admin Panel" />
        <Controls
          users={users}
          brojAktivnih={brojAktivnih}
          showActive={showActive}
          setShowActive={setShowActive}
          newUser={newUser}
          setNewUser={setNewUser}
          adding={adding}
          handleBarcode={() => setScannerVisible(true)}
          handleAddUser={handleAddUser}
        />
        <BarcodeScannerModal
          visible={scannerVisible}
          onScan={handleBarcodeAdd}
          onClose={() => setScannerVisible(false)}
        />
        <FlatList
          data={displayedUsers}
          keyExtractor={(i, idx) => `${i.user}_${idx}`}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onEdit={() => openEditModal(item)}
              onDelete={() => openDeleteModal(item)}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUsers(); }} />}
          contentContainerStyle={styles.list}
        />
        <Portal>
          <Modal visible={modalDelete} contentContainerStyle={styles.modalBox} dismissable onDismiss={() => setModalDelete(false)}>
            <Text style={styles.modalText}>Obriši korisnika {selectedUser?.user}?</Text>
            <View style={styles.modalActions}>
              <Button onPress={handleDeleteUser}>Da</Button>
              <Button onPress={() => setModalDelete(false)}>Ne</Button>
            </View>
          </Modal>
          <Modal visible={modalEdit} contentContainerStyle={styles.modalBox} dismissable onDismiss={() => setModalEdit(false)}>
            <TextInput label="Korisničko ime" value={editUser.user} onChangeText={text => setEditUser({...editUser, user: text})} style={styles.input} />
            <TextInput label="Šifra" secureTextEntry value={editUser.pass} onChangeText={text => setEditUser({...editUser, pass: text})} style={styles.input} />
            <View style={styles.pickerWrap}>
              <Picker selectedValue={editUser.role} onValueChange={val => setEditUser({...editUser, role: val})}>
                <Picker.Item label="Korisnik" value="user" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
            <View style={styles.modalActions}>
              <Button mode="contained" onPress={handleEditUser}>Spremi</Button>
              <Button onPress={() => setModalEdit(false)}>Otkaži</Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </Provider>
  );
}