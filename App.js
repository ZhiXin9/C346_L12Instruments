import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';

export default function App() {
  const [shake, setShake] = useState(false);
  const [shakeSound, setShakeSound] = useState(null);
  const [buttonSound, setButtonSound] = useState(null);

  useEffect(() => {
    let subscription;

    // Set sensor update interval
    Accelerometer.setUpdateInterval(100);

    const subscribe = async () => {
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (!isAvailable) {
        console.log('Accelerometer not available on this device');
        return;
      }

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);

        if (acceleration > 1.8) {
          setShake(true);
          playShakeSound();
        } else {
          setShake(false);
        }
      });
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  async function playShakeSound() {
    try {
      if (shakeSound) {
        await shakeSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
          require('./assets/shake.wav')
      );
      setShakeSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing shake sound:', error);
    }
  }

  async function playButtonSound() {
    try {
      if (buttonSound) {
        await buttonSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
          require('./assets/guitar.wav')
      );
      setButtonSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing button sound:', error);
    }
  }

  return (
      <View style={styles.container}>
        {shake ? <Text style={styles.text}>SHAKE</Text> : <Text style={styles.inactiveText}>Move the phone</Text>}
        <Button title="Play Button Sound" onPress={playButtonSound} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  text: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
  },
  inactiveText: {
    fontSize: 20,
    color: 'gray',
    marginBottom: 20,
  },
});
