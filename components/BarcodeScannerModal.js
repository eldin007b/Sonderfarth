
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Button,
  Platform
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BarcodeScannerModal({ visible, onScan, onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const playBeep = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/bip.mp3")
    );
    await sound.playAsync();
  };

  const handleBarCodeScanned = async ({ data }) => {
  if (scanned) return;

  const isUser = /^[0-9]+$/.test(data);         // samo brojevi
  const isPassword = /[a-zA-Z]/.test(data);     // sadrži barem jedno slovo

  if (isUser && !user) {
    setUser(data);
    await playBeep();
  } else if (isPassword && !password) {
    setPassword(data);
    await playBeep();
  }

  if ((user || isUser) && (password || isPassword)) {
    const finalUser = user || (isUser ? data : null);
    const finalPass = password || (isPassword ? data : null);

    if (finalUser && finalPass) {
      setScanned(true);
      await playBeep();
      onScan({ user: finalUser.trim(), password: finalPass.trim() });
      setTimeout(() => {
        setScanned(false);
        setUser(null);
        setPassword(null);
        onClose();
      }, 300);
    }
  }
};

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent>
      <View style={styles.container}>
        <Pressable
          style={styles.closeBtn}
          onPress={() => {
            setScanned(false);
            setUser(null);
            setPassword(null);
            onClose();
          }}
        >
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={36}
            color="#fff"
          />
        </Pressable>

        {hasPermission === null ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : hasPermission === false ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>
              Kamera nije dostupna. Provjeri dozvole.
            </Text>
            <Button
              title="Zatvori"
              onPress={() => {
                setScanned(false);
                setUser(null);
                setPassword(null);
                onClose();
              }}
            />
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                "code128",
                "code39",
                "code93",
                "ean13",
                "ean8",
                "upc_a",
                "upc_e",
              ],
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "android" ? 40 : 60,
    right: 20,
    zIndex: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
