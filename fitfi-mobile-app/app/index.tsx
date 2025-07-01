import '../global.css';
import { Text, View, StyleSheet } from 'react-native';

export default function Index() {
  verifyInstallation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This page is big.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 20,
    color: '#333',
  },
});
