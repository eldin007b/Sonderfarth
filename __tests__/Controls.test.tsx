import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Controls from '../src/components/Controls';

describe('Controls Component', () => {
  const props = {
    users: [{ user: 'u', role: 'user', last_login: null }],
    brojAktivnih: 0,
    showActive: false,
    setShowActive: jest.fn(),
    newUser: { user: '', pass: '', role: 'user' },
    setNewUser: jest.fn(),
    adding: false,
    handleBarcode: jest.fn(),
    handleAddUser: jest.fn(),
  };

  it('renders stats correctly', () => {
    const { getByText } = render(<Controls {...props} />);
    expect(getByText('Ukupno: 1')).toBeTruthy();
    expect(getByText('Aktivni: 0')).toBeTruthy();
  });

  it('calls handleAddUser on button press', () => {
    const { getByText } = render(<Controls {...props} />);
    fireEvent.press(getByText('Dodaj korisnika'));
    expect(props.handleAddUser).toHaveBeenCalled();
  });
});
