import React, { useEffect, useState } from "react";
import {
	SafeAreaView,
	Text,
	FlatList,
	TouchableOpacity,
	Alert,
	StyleSheet,
	View,
	Image,
	PermissionsAndroid
} from "react-native";

import helloIcon from "../assets/images/ico-hello.png";
import turnOnIcon from "../assets/images/turn-on.png";
import turnOffIcon from "../assets/images/turn-off.png";
import reactIcon from "../assets/images/icon.png";

import RNBluetoothClassic from "react-native-bluetooth-classic";

const requestBTPermission = async () => {
	try {
		const granted = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
			{
				title: 'Permiso de Bluetooth',
				message: 'La app requiere bluetooth para comunicarse con el dispositivo',
				buttonNeutral: 'Ask Me Later',
				buttonNegative: 'Cancel',
				buttonPositive: 'OK',
			},
		);
		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			console.log('permiso concedido');
		} else {
			console.log('el usuario NEGO el permiso de bluetooth');
		}
	} catch (err) {
		console.warn(err);
	}
};

export default function Index() {
	//En RN se utiliza el concepto de "states" para manejar datos que pueden cambiar a lo largo del tiempo. 
	// "devices" para almacenar la lista de dispositivos Bluetooth emparejados, 
	// "loading" para indicar si estamos cargando los dispositivos o no.
	const [devices, setDevices] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedDevice, setSelectedDevice] = useState<any>(null);

	useEffect(() => {
		loadDevices();
	}, []);

	const loadDevices = async () => {

		requestBTPermission();
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

	//funcion de prueba/ejemplo para enviar un mensaje al dispositivo Bluetooth seleccionado.
	const sendHelloWorld = async (device: any) => {
		try {
			console.log("Conectando a:", device.name);

			const connected = await device.connect();

			if (!connected) {
				Alert.alert("Fallo la conexion");
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

	//funcion llamada cuando se toca un boton de dispositivo de la lista de dispositivos emparejados
	const handleSelectDevice = (device: any) => {
		setSelectedDevice(device);
		console.log("Dispositivo seleccionado:", device.name);
	};

	const ledOn=async(device: any) => {
		try{
			const connected = await device.connect();
			 await device.write("H");
				await device.disconnect();
		} catch (err) {
			console.error(err);
			Alert.alert("Error", String(err));
		}
	};
	
	const ledOff=async(device: any) => {
		try{
			const connected = await device.connect();
			 await device.write("L");
				await device.disconnect();
		} catch (err) {
			console.error(err);
			Alert.alert("Error", String(err));
		}
	};

	//renderItem es llamado por cada elemento de la lista de dispositivos emparejados
	const renderItem = ({ item }: any) => (
		<TouchableOpacity
			style={styles.device}
			onPress={() => handleSelectDevice(item)}
		>
			<Text style={styles.name}>
				{item.name || "Dispositivo Desconocido"}
			</Text>

			<Text style={styles.address}>
				{item.address}
			</Text>
		</TouchableOpacity>
	);

//menu de la funcionalidad principal de la app, que se muestra cuando se ha seleccionado un dispositivo Bluetooth.
	const mainAppMenu = () => (
		<View style={styles.selectedCard}>
			<Text style={styles.name}>
			{selectedDevice.name || "Desconocido"}
			</Text>

			<View style={styles.grid}>
				<TouchableOpacity style={styles.cell} 
				onPress={() => ledOn(selectedDevice)}>
					<Image source={turnOnIcon} style={styles.buttonIcon} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.cell} 
				onPress={() => ledOff(selectedDevice)}>
					<Image source={turnOffIcon} style={styles.buttonIcon} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.cell} 
				onPress={() => sendHelloWorld(selectedDevice)}>
					<Image source={helloIcon} style={styles.buttonIcon} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.cell} >
					<Image source={reactIcon} style={styles.buttonIcon} />
				</TouchableOpacity>
			</View>

		</View>
	);

// el layout se lee de esta manera: SafeAreaView es el contenedor principal que asegura que el contenido no se 
// superponga con elementos del sistema como la barra de estado. Dentro de este contenedor, se muestra un título, 
// seguido de una sección que muestra el estado de carga o el dispositivo seleccionado, o la lista de dispositivos 
// emparejados. Finalmente, hay un botón para actualizar la lista de dispositivos.	

//en JSX, se usa la sintaxis {condicion ? <Componente1 /> : <Componente2 />} para mostrar un componente u otro dependiendo de una condición.

// si loading es true, solo se muestra un mensaje de "Cargando...". 
//		si no, comprueba si hay un dispositivo seleccionado. si está seleccionado, muestra el nombre del dispositivo. 
//		si no hay un dispositivo seleccionado, muestra la lista de dispositivos emparejados utilizando FlatList.
	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>Dispositivos emparejados</Text>

			{loading ? (
				<Text>Cargando...</Text>
			) : selectedDevice ? 
				mainAppMenu()
			 : (<>
				<FlatList
					data={devices}
					keyExtractor={(item) => item.address}
					renderItem={renderItem}
					ListEmptyComponent={
						<Text>No se encontraron dispositivos</Text>
					}
				/>
				<View style={{ marginTop: 30 }}>
				<TouchableOpacity
					style={styles.reloadButton}
					onPress={loadDevices}>
					<Text style={styles.reloadText}>Actualizar lista de dispositivos</Text>
				</TouchableOpacity>
				</View>
				</>
			)
			}

			
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

	selectedCard: {
		padding: 16,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		backgroundColor: "#f9f9f9",
	},

	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 20,
		paddingBottom: 10,
	},
	cell: {
		width: "45%",
		height: 100,
		borderRadius: 10,
		borderWidth: 2,
		backgroundColor: "#bcd4ff",
		borderColor: "#007AFF",
		justifyContent: "center",
		alignItems: "center"
	},
	buttonIcon: {
		width: 60,
		height: 60,
	}
});