import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, Button } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState, useContext } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './pages/HomeScreen';
import CalendarScreen from './pages/CalendarScreen';
import UploadScreen from './pages/UploadScreen';
import AlbumsScreen from './pages/AlbumsScreen';
import ProfileScreen from './pages/ProfileScreen';
import AppNavigator from './pages/AppNavigator';
import { EventRegister } from 'react-native-event-listeners'
import theme from './theme/theme';
import themeContext from './theme/themeContext';
import { background } from '@cloudinary/url-gen/qualifiers/focusOn';
const Tab = createBottomTabNavigator();

// function for button to change when being pressed
const ColorChangingButton = ({ defaultIconName, pressedIconName, iconSize = 40, onPress }) => {
  const [iconName, setIconName] = useState(defaultIconName);
  const theme = useContext(themeContext);


  const pressed = () => {
    setIconName(pressedIconName);
  };

  const unPressed = () => {
    setIconName(defaultIconName);
  };

  return (
    <Pressable
      onPressIn={pressed}
      onPressOut={unPressed}
      onPress={onPress}
    >
      <Ionicons name={iconName} size={iconSize} color={theme.color} />
    </Pressable>
  );
};

function CustomHeader({ navigation }) {
  const theme = useContext(themeContext);

  return (
    <View style={[styles.header, {backgroundColor: theme}]}>
      <Text style={[styles.title, {color: theme.color}]}>Fitted.</Text>
      <ColorChangingButton 
        defaultIconName="dice-outline"
        pressedIconName="dice"
        onPress={() => console.log('Shuffle button pressed')}
      />
    </View>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const listener = EventRegister.addEventListener('ChangeTheme', (data) => {
      setDarkMode(data)
    })
    return () => {
      EventRegister.removeAllListeners(listener)
    }
  }, [darkMode])

  return (
    <themeContext.Provider value={darkMode === true ? theme.dark : theme.light}>
      <NavigationContainer theme={darkMode === true ? DarkTheme : DefaultTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused
                  ? "shirt"
                  : "shirt-outline";
              }
              if (route.name === 'Calendar') {
                iconName = focused
                  ? "calendar-clear"
                  : "calendar-clear-outline";
              }
              if (route.name === 'Upload') {
                iconName = focused
                  ? "add-circle"
                  : "add-circle-outline";
              }
              if (route.name === 'Albums') {
                iconName = focused
                  ? "albums"
                  : "albums-outline";
              }
              if (route.name === 'Profile') {
                iconName = focused
                  ? "person"
                  : "person-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#800f2f",
            tabBarInactiveTintColor: "#6c757d",
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              header: () => <CustomHeader />,
              headerStyle: {
                backgroundColor: 'white',
                elevation: 0,
                shadowOpacity: 0,
              },
            }}
          />
          <Tab.Screen name="Calendar" component={CalendarScreen} />
          <Tab.Screen name="Upload" component={UploadScreen} />
          <Tab.Screen name="Albums" component={AppNavigator} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </themeContext.Provider>
  );
}


const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 98,
    paddingHorizontal: 15,
    elevation: 1,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    position: 'absolute',
    top: 50,
    left: 20,
    fontSize: 45,
  },
  horizontalLine: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'black',
  },
  topLine: {
    position: 'absolute',
    top: 105,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'black',
  },
  home: {
    position: 'absolute',
    left: 30,
    right: 0,
    bottom: 35,

  },
  calendar: {
    position: 'absolute',
    left: 105,
    right: 0,
    bottom: 35,
  },
  plus: {
    position: 'absolute',
    left: 180,
    right: 0,
    bottom: 35,
  },
  album: {
    position: 'absolute',
    left: 255,
    right: 0,
    bottom: 35,
  },
  profile: {
    position: 'absolute',
    left: 330,
    right: 0,
    bottom: 35,

  },
  dice: {
    position: 'absolute',
    left: 330,
    top: 60,

  },

});
