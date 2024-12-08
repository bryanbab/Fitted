import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AlbumsScreen from './AlbumsScreen';
import AlbumDetailScreen from './AlbumDetailScreen';
import { EventRegister } from 'react-native-event-listeners'


const Stack = createStackNavigator();
console.log(Stack.Navigator.screens);

export default function AppNavigator() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Albums" component={AlbumsScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AlbumDetailScreen" component={AlbumDetailScreen} options={{
          headerTitle: "", headerShown: false}}/>
      </Stack.Navigator>
    );
  }
