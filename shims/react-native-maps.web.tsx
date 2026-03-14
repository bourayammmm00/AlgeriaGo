import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web shim for react-native-maps (not supported on web)
const MapView = ({ children, style, ...props }: any) => (
  <View style={[styles.container, style]}>
    <View style={styles.placeholder}>
      <Text style={styles.text}>Carte disponible sur mobile</Text>
      <Text style={styles.subtext}>Ouvrez l'app sur Android/iOS pour voir la carte</Text>
    </View>
    {children}
  </View>
);

const Marker = (_props: any) => null;
const Polyline = (_props: any) => null;
const Callout = (_props: any) => null;
const Circle = (_props: any) => null;
const Polygon = (_props: any) => null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E3B',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default MapView;
export { Marker, Polyline, Callout, Circle, Polygon };
