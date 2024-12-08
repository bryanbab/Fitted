import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import supabase from './supabase-service';
import themeContext from '../theme/themeContext';


export default function AlbumDetailScreen({ route }) {
  const { albumId, albumName } = route.params;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useContext(themeContext);


  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('album_items')
          .select(`
            *,
            shirt_id(image_url),
            pant_id(image_url),
            shoe_id(image_url)
          `)
          .eq('album_id', albumId); // match the albumId
    
        if (error) throw error;
    
        console.log('Fetched Images:', data); // Log the result to check if we get the correct data
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error.message);
      } finally {
        setLoading(false);
      }
    };      
    fetchImages();
  }, [albumId]);

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor:theme}]}>
        <Text style={[styles.title, {color: theme.color}]}>Loading images...</Text>
      </View>
    );
  }

  const baseUrl = 'https://jnwydjjsvdkifjnbmkzk.supabase.co/storage/v1/object/public/uploads/';

  return (
    <View style={[styles.container, {backgroundColor:theme}]}>
      <Text style={[styles.title, {color: theme.color}]}>{albumName}</Text>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => {
          // Collect the images into an array (excluding nulls)
          const imagesToDisplay = [];
          if (item.shirt_id?.image_url) {
            // Add the full URL for the shirt image
            imagesToDisplay.push(baseUrl + item.shirt_id.image_url);
          }
          if (item.pant_id?.image_url) {
            imagesToDisplay.push(baseUrl + item.pant_id.image_url);
          }
          if (item.shoe_id?.image_url) {
            imagesToDisplay.push(baseUrl + item.shoe_id.image_url);
          }
  
          return (
            <View style={styles.imageContainer}>
              {imagesToDisplay.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.image} />
              ))}
            </View>
          );
        }}
        contentContainerStyle={styles.imageGrid}
      />
    </View>
  );
  
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageGrid: {
    justifyContent: 'center',
  },
  image: {
    width: 150,
    height: 200,
    margin: 8,
    borderRadius: 8,
  },
});