import React from 'react';
import { Appbar } from 'react-native-paper';

export default function Header({ navigation, title }) {
  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title={title} />
      <Appbar.Action icon="home" onPress={() => navigation.replace('MainMenu')} />
    </Appbar.Header>
  );
}
