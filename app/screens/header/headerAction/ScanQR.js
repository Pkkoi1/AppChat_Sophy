import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

export default function ScanQR() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setQrData(data);
  };

  const handleLinkPress = () => {
    Linking.openURL(qrData);
  };

  if (!permission) {
    return <Text style={styles.text}>Đang kiểm tra quyền truy cập camera...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Ứng dụng cần quyền truy cập camera để quét mã QR.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cho phép truy cập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topLeftCorner} />
          <View style={styles.topRightCorner} />
          <View style={styles.bottomLeftCorner} />
          <View style={styles.bottomRightCorner} />
        </View>
      </CameraView>
      {scanned && qrData && (
        <View style={styles.bottomContainer}>
          <Text style={styles.text}>Đã quét mã QR:</Text>
          {isValidUrl(qrData) ? (
            <TouchableOpacity onPress={handleLinkPress}>
              <Text style={styles.linkText}>{qrData}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.text}>{qrData}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={() => { setScanned(false); setQrData(null); }}>
            <Text style={styles.buttonText}>Quét lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderColor: '#fff',
    borderWidth: 2,
  },
  topLeftCorner: {
    position: 'absolute',
    top: 300,
    left: 100,
    width: 30,
    height: 30,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: '#fff',
  },
  topRightCorner: {
    position: 'absolute',
    top: 300,
    right: 100,
    width: 30,
    height: 30,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: '#fff',
  },
  bottomLeftCorner: {
    position: 'absolute',
    bottom: 300,
    left: 100,
    width: 30,
    height: 30,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: '#fff',
  },
  bottomRightCorner: {
    position: 'absolute',
    bottom: 300,
    right: 100,
    width: 30,
    height: 30,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: '#fff',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: '#42a5f5',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#42a5f5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});