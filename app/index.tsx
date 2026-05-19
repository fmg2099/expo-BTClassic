import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  View,
} from "react-native";

import RNBluetoothClassic from "react-native-bluetooth-classic";

export default function Index() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);

      const enabled =
        await RNBluetoothClassic.isBluetoothEnabled();

      if (!enabled) {
        Alert.alert("Bluetooth está deshabilitado");
        return;
      }

      const bondedDevices =
        await RNBluetoothClassic.getBondedDevices();

      setDevices(bondedDevices);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", String(err));
    } finally {
      setLoading(false);
    }
  };

  const sendHelloWorld = async (device: any) => {
    try {
      console.log("Conectando a:", device.name);

      const connected = await device.connect();

      if (!connected) {
        Alert.alert("Fallo la conexcion");
        return;
      }

      await device.write("hola mundo desde android\n");

      Alert.alert(`Enviado a ${device.name}`);

      await device.disconnect();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", String(err));
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.device}
      onPress={() => sendHelloWorld(item)}
    >
      <Text style={styles.name}>
        {item.name || "Unknown Device"}
      </Text>

      <Text style={styles.address}>
        {item.address}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dispositivos emparejados</Text>

      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.address}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text>No se encontraron dispositivos</Text>
          }
        />
      )}

      <View style={{ marginTop: 30 }}>
        <TouchableOpacity
          style={styles.reloadButton}
          onPress={loadDevices}>
          <Text style={styles.reloadText}>Actualizar lista de dispositivos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  device: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
  },

  address: {
    marginTop: 4,
    color: "#666",
  },

  reloadButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  reloadText: {
    color: "white",
    fontWeight: "600",
  },
});