import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from "react-native-modal";
import { DateTimePickerModal } from 'react-native-modal-datetime-picker';
import supabase from './supabase-service';
import themeContext from '../theme/themeContext';


const HomeScreen = () => {
  const [shirts, setShirts] = useState([]);
  const [pants, setPants] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [selectedShirt, setSelectedShirt] = useState(null);
  const [selectedPant, setSelectedPant] = useState(null);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeletingMode, setIsDeletingMode] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [tappedItems, setTappedItems] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const animations = useRef([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAlbumModalVisible, setIsAlbumModalVisible] = useState(false);
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false); // New state for the options modal
  const theme = useContext(themeContext);



  const fetchImages = async (category, setCategoryImages) => {
    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .list(category, { limit: 100 });

      if (error) {
        Alert.alert('Error', `Could not fetch ${category} images.`);
        return;
      }

      const categoryImages = data.map((item) => ({
        id: item.id,
        name: item.name,
        uri: supabase.storage.from('uploads').getPublicUrl(`${category}/${item.name}`).data.publicUrl,
        type: category.slice(0, -1),
      }));

      console.log("Fetched category images:", categoryImages);
      setCategoryImages(categoryImages);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while loading images.');
    }
  };

  useEffect(() => {
    fetchImages('shirts', setShirts);
    fetchImages('pants', setPants);
    fetchImages('shoes', setShoes);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchImages('shirts', setShirts);
      fetchImages('pants', setPants);
      fetchImages('shoes', setShoes);
    }, [])
  );

  const deleteItem = async (category, item) => {
    try {
      const { error } = await supabase.storage.from('uploads').remove([`${category}/${item.name}`]);
      if (error) {
        Alert.alert('Error', `Failed to delete ${item.name}.`);
        return;
      }

      if (category === 'shirts') setShirts((prev) => prev.filter((shirt) => shirt.name !== item.name));
      if (category === 'pants') setPants((prev) => prev.filter((pant) => pant.name !== item.name));
      if (category === 'shoes') setShoes((prev) => prev.filter((shoe) => shoe.name !== item.name));
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while deleting the item.');
    }
  };

  const startShaking = () => {
    animations.current = shirts.concat(pants, shoes).map(() => new Animated.Value(0));
    Animated.loop(
      Animated.stagger(
        100,
        animations.current.map((anim) =>
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 50, useNativeDriver: true }),
            Animated.timing(anim, { toValue: -1, duration: 50, useNativeDriver: true }),
          ])
        )
      )
    ).start();
  };

  const toggleDeletingMode = () => {
    const newMode = !isDeletingMode;
    setIsDeletingMode(newMode);
    if (newMode) {
      startShaking();
    }
    console.log(`Deleting mode is now: ${newMode}`);
  };

  const handleDoubleTap = (category, item) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastTap;

    // If it's a double-tap, toggle the opacity state for the item
    if (timeDiff < 300 && timeDiff > 0) {
      console.log(`${category} ${item.name} was double-tapped!`);

      // Toggle the tapped state for the item
      setTappedItems((prevTappedItems) => ({
        ...prevTappedItems,
        [`${category}_${item.id}`]: !prevTappedItems[`${category}_${item.id}`],
      }));

      // Set the selected item if it's a double-tap
      if (category === 'shirts') setSelectedShirt(item);
      if (category === 'pants') setSelectedPant(item);
      if (category === 'shoes') setSelectedShoe(item);
      console.log(item.id);
    } else {
      setLastTap(currentTime);
    }
  };


  const handleAddPress = () => {
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedDate || !selectedShirt || !selectedPant || !selectedShoe) {
      Alert.alert('Error', 'Please select a shirt, pant, shoe, and date.');
      return;
    }

    try {
      // Insert the event data
      const { data: eventData, error: eventError } = await supabase
        .from('calendar_events')
        .insert([
          {
            shirt_id: selectedShirt.id,
            pant_id: selectedPant.id,
            shoe_id: selectedShoe.id,
          },
        ])
        .single();

      if (eventError) {
        console.error('Event Insert Error:', eventError);  // Log the detailed error
        Alert.alert('Error', `Failed to save the event. ${eventError.message}`);
        return;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('shirt_id', selectedShirt.id)
        .eq('pant_id', selectedPant.id)
        .eq('shoe_id', selectedShoe.id)

      if (!data) {
        Alert.alert('Error', 'No data recieved.');
        return;
      }

      if (error) {
        Alert.alert('Error', `Could not transfer calendar even id.`);
        return;
      }

      console.log(data);

      // Insert the event date
      const { error: dateError } = await supabase
        .from('event_dates')
        .insert([
          {
            calendar_event_id: data[0].id,
            event_date: selectedDate.toISOString(),
          },
        ]);

      if (dateError) {
        console.error('Date Insert Error:', dateError);  // Log the detailed error
        Alert.alert('Error', `Failed to save the event date. ${dateError.message}`);
        return;
      }

      Alert.alert('Success', 'Outfit saved successfully!');
      setModalVisible(false);
    } catch (error) {
      console.error('Unexpected error:', error);  // Log the unexpected error
      Alert.alert('Error', 'Something went wrong while saving the outfit.');
    }
  };

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase.from('albums').select('*');
      if (error) {
        Alert.alert('Error', 'Could not fetch albums.');
        return;
      }
      setAlbums(data);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while fetching albums.');
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleAddToAlbumPress = (item) => {
    setSelectedItem(item);
    setIsAlbumModalVisible(true);
  };

  

  
  const handleAddToAlbum = async (album) => {
    if (!selectedItem) {
      Alert.alert('Error', 'No item selected.');
      return;
    }
  
    console.log('Selected Item:', selectedItem);  // Log the entire item to check
  
    let itemData = {};
  
    console.log('Selected Item ID:', selectedItem.id);  // Log the entire item to check

    // Check for the type and log its value
    console.log('Selected Item Type:', selectedItem.type);
  
    if (selectedItem.type === 'shirt') {
      itemData.shirt_id = selectedItem.id;
    } else if (selectedItem.type === 'pant') {
      itemData.pant_id = selectedItem.id;
    } else if (selectedItem.type === 'shoe') {
      itemData.shoe_id = selectedItem.id;
    } else {
      console.error('Unknown item type:', selectedItem.type);
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from('album_items')
        .insert([
          {
            album_id: album.id,
            ...itemData,
          },
        ])
        .single();
  
      if (error) {
        console.error('Insert error:', error);
        Alert.alert('Error', `Failed to add item to album: ${error.message}`);
        return;
      }
  
      console.log('Item added to album:', data); // Successful insert logging
      Alert.alert('Success', 'Item added to album!');
      setIsAlbumModalVisible(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Something went wrong while adding the item to the album.');
    }
  };  
  





  const renderCategory = (category, items, itemStyles, label) => {
    return (
      <View style={styles.category}>
        <Text style={[styles.categoryTitle,  {color: theme.color}]}>{label}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items.map((item, index) => {
            const shakeAnimation = animations.current[index]?.interpolate({
              inputRange: [-1, 1],
              outputRange: ['-2deg', '2deg'],
            });

            const isTapped = tappedItems[`${category}_${item.id}`];
            const opacity = isTapped ? 0.5 : 1;

            return (
              <TouchableOpacity
                key={item.id}
                onLongPress={toggleDeletingMode}
                onPress={() => handleDoubleTap(category, item)}
              >
                <Animated.View style={isDeletingMode ? { transform: [{ rotate: shakeAnimation }] } : null}>
                  {isDeletingMode && (
                    <>
                      {/* Red Delete Button */}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteItem(category, item)}
                      >
                        <Text style={styles.deleteText}>X</Text>
                      </TouchableOpacity>

                      {/* White Plus Button */}
                      <TouchableOpacity
                        style={styles.addButtonToAlbum}
                        onPress={() => handleAddToAlbumPress(item)}
                      >
                        <Text style={styles.addText}>+</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <Animated.Image
                    source={{ uri: item.uri }}
                    style={[itemStyles, { opacity }]}
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };


  return (
    <TouchableWithoutFeedback onPress={() => {
      if (isDeletingMode) {
        setIsDeletingMode(false);
      }
    }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView style={styles.container}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {renderCategory('shirts', shirts, styles.shirtImage, 'Shirts')}
            {renderCategory('pants', pants, styles.pantImage, 'Pants')}
            {renderCategory('shoes', shoes, styles.shoeImage, 'Shoes')}
          </ScrollView>

          <TouchableOpacity style={[styles.addButton, {backgroundColor: theme.buttonColor}]} onPress={handleAddPress}>
            <Ionicons name="add" size={30} color="#000000" />
          </TouchableOpacity>

          {/* Modal for Date Selection */}
          <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} >
            <View style={[styles.modalContent, {backgroundColor: theme.backgroundColor}]}>
              <Text style={[styles.modalTitle, {color: theme.color}]}>Select Date</Text>
              <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
                <Text style={styles.datePickerButton}>Choose Date</Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(date) => {
                  setSelectedDate(date);
                  setIsDatePickerVisible(false);
                }}
                onCancel={() => setIsDatePickerVisible(false)}
                textColor= 'black'
              />

              {selectedDate && (
                <Text style={[styles.selectedDate, {color: theme.color}]}>
                  {selectedDate.toLocaleDateString()}
                </Text>
              )}

              <TouchableOpacity style={[styles.saveButton]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Outfit</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal isVisible={isAlbumModalVisible} onBackdropPress={() => setIsAlbumModalVisible(false)}>
            <View style={[styles.modalContent, {backgroundColor: theme.shadowColor}]}>
              <Text style={[styles.modalTitle, {color: theme.color}]}>Choose an Album</Text>
              {albums.map((album) => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.albumButton}
                  onPress={() => handleAddToAlbum(album)}
                >
                  <Text style={[styles.input, {backgroundColor: theme.backgroundColor},  {color: theme.color}]}>{album.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  category: {
    marginVertical: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shirtImage: {
    width: 160,
    height: 160,
    marginRight: 10,
    borderRadius: 10,
  },
  pantImage: {
    width: 160,
    height: 220,
    marginRight: 10,
    borderRadius: 10,
  },
  shoeImage: {
    width: 160,
    height: 160,
    marginRight: 10,
    borderRadius: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#800f2f',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  albumButton: { 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 10,
    textAlign: 'center'

  },
  input: {
    fontSize: 15,
    height: 22,
    width: '100%',
    borderWidth: 1,
    borderRadius: 7,
    marginBottom: 15,
    paddingHorizontal: 70,
    borderColor: '#800f2f',
    alignContent: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  
  },
  datePickerButton: {
    fontSize: 16,
    color: '#007bff',
  },
  selectedDate: {
    fontSize: 16,
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButtonToAlbum: {
    position: 'absolute',
    top: 5,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  addText: {
    marginTop: -2,
    color: 'black',
    fontSize: 20,
  },
});

export default HomeScreen;