import React, { useState, useEffect, useContext } from 'react';
import { Button, Text, SafeAreaView, StyleSheet, View, Alert, TextInput, Image, FlatList, ScrollView, TouchableOpacity, Navigation } from 'react-native';
import {
  createStaticNavigation,
  useNavigation,
} from '@react-navigation/native';
import Modal from "react-native-modal";
import Ionicons from '@expo/vector-icons/Ionicons';
import supabase from './supabase-service';
import AlbumDetailScreen from './AlbumDetailScreen';
import themeContext from '../theme/themeContext';


export default function AlbumsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albums, setAlbums] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null) //image uri
  const [albumContents, setAlbumContents] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const navigation = useNavigation();
  console.log('Navigation object:', navigation);
  const baseUrl = 'https://jnwydjjsvdkifjnbmkzk.supabase.co/storage/v1/object/public/uploads/';
  const theme = useContext(themeContext);



  const handleAddPress = () => {
    setModalVisible(true);
  };
  const fetchAlbum = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select("id, name, album_items(shirt_id, pant_id, shoe_id)") // Fetch album items with shirt, pant, and shoe IDs

      if (error) {
        console.error('Error fetching albums:', error.message);
        Alert.alert('Error', 'Could not fetch album.');
        return;
      }

      // Fetch images for shirt_id, pant_id, and shoe_id
      const updatedAlbums = await Promise.all(data.map(async (album) => {
        const albumItems = album.album_items || [];
        for (let item of albumItems) {
          if (item.shirt_id) {
            // Fetch shirt image
            const { data: shirtData, error: shirtError } = await supabase
              .from('shirts')
              .select('image_url')
              .eq('id', item.shirt_id);
            if (shirtData && shirtData[0]) {
              item.shirt_image_url = shirtData[0].image_url;
            }
          }
          if (item.pant_id) {
            // Fetch pant image
            const { data: pantData, error: pantError } = await supabase
              .from('pants')
              .select('image_url')
              .eq('id', item.pant_id);
            if (pantData && pantData[0]) {
              item.pant_image_url = pantData[0].image_url;
            }
          }
          if (item.shoe_id) {
            // Fetch shoe image
            const { data: shoeData, error: shoeError } = await supabase
              .from('shoes')
              .select('image_url')
              .eq('id', item.shoe_id);
            if (shoeData && shoeData[0]) {
              item.shoe_image_url = shoeData[0].image_url;
            }
          }
        }
        return album;
      }));

      setAlbums(updatedAlbums); // Update state with albums and images
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', 'Something went wrong while loading albums.');
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, []);


  const handleCreateAlbum = async () => {
    if (albumTitle.trim() === "") {
      Alert.alert("Error", "Album title cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert([{ name: albumTitle }])
        .select();

      if (albumError) {
        throw albumError;
      }

      // Add the new album to the local state
      setAlbums((prevAlbums) => [...prevAlbums, albumData[0]]);
      setAlbumTitle(""); // Clear the album title after creation
      setModalVisible(false); // Close the modal
      Alert.alert("Album created!");
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', 'Could not create album.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.addAlbum} onPress={handleAddPress}>
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>

      <FlatList
        data={albums}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => {
          console.log('Rendering Album:', item); // Log album data being rendered
          if (item.album_items && item.album_items.length > 0) {
            console.log('First Album Item:', item.album_items[0]); // Log the first album item
            console.log('Image URLs:', {
              shirt: item.album_items[0]?.shirt_image_url,
              pant: item.album_items[0]?.pant_image_url,
              shoe: item.album_items[0]?.shoe_image_url,
            });
          }

          return (
            <View style={[styles.albumCover, {backgroundColor: theme.shadowColor}]}>
              <Text style={[styles.albumTitle, {color: theme.color}]}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('AlbumDetailScreen', {
                    albumId: item.id,
                    albumName: item.name,
                  });
                }}
              >
                {item.album_items && item.album_items.length > 0 ? (
                  <Image
                    source={{
                      uri:
                        (item.album_items[0]?.shirt_image_url &&
                          `${baseUrl}${item.album_items[0]?.shirt_image_url}`) ||
                        (item.album_items[0]?.pant_image_url &&
                          `${baseUrl}${item.album_items[0]?.pant_image_url}`) ||
                        (item.album_items[0]?.shoe_image_url &&
                          `${baseUrl}${item.album_items[0]?.shoe_image_url}`)
                    }}
                    style={styles.coverImage}
                  />
                ) : (
                  <Ionicons
                    style={styles.noImageIcon}
                    name="images-outline"
                    size={35}
                  />
                )}
              </TouchableOpacity>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />


      {/* Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={[styles.modalContent, {backgroundColor: theme.backgroundColor}]}>
          <Text style={[styles.modalTitle, {color: theme.color}]}>New Album</Text>
          <Text style={[styles.text, {color: theme.color}]}>Enter a name for this album.</Text>
          <TextInput
            style={[styles.input, {borderColor: theme.buttonBorderColor}]}
            placeholder="Enter Album Title"
            value={albumTitle}
            onChangeText={setAlbumTitle}
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              color="red"
              onPress={() => setModalVisible(false)}
            />
            <Button title="Save" onPress={handleCreateAlbum} disabled={isLoading} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignContent: 'stretch',
    left: 3,
    flexDirection: 'row',
  },
  addAlbum: {
    position: 'absolute',
    bottom: -425,
    right: 20,
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 32,
    marginLeft: 30,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    height: 30,
    width: '100%',
    borderColor: 'rgba(0,0,0,0.10)',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  albumTitle: {
    fontSize: 15,
    alignSelf: 'center',
    top: 165,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginTop: 10,
  },
  noImageIcon: {
    width: 100,
    height: 100,
    marginTop: 20,
    left: 33,
    alignSelf: 'center',
    color: 'gray',
    size: 40,
  },
  albumCover: {
    backgroundColor: '#D3D3D3',
    padding: 25,
    borderRadius: 3,
    height: 175,
    width: 175,
    marginTop: 15,
    alignContent: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    marginHorizontal: 10,
    zIndex: 0,
  },
  coverImage: {
    width: '100%', // Match the parent width
    height: '110%', // Slightly larger height to center the image visually
    resizeMode: 'cover',
    top: -30,
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
});