import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import supabase from './supabase-service';
import axios from 'axios';
import themeContext from '../theme/themeContext';


const UploadPage = () => {
    const [imageUri, setImageUri] = useState(null);
    const [itemType, setItemType] = useState('shirts');
    const [loading, setLoading] = useState(false);
    const theme = useContext(themeContext);


    useEffect(() => {
        const requestCameraPermissions = async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Camera permission is required to take a picture.');
            }
        };
        requestCameraPermissions();
    }, []);

    const takePhoto = async (selectedItemType) => {
        setLoading(true);
        console.log("Loading started");
        
        setItemType(selectedItemType); // selected item type (shirt, pants, shoes)
        try {
            const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1, base64: true };
            const response = await ImagePicker.launchCameraAsync(options);

            if (!response.canceled && response.assets && response.assets.length > 0) {
                const base64Data = response.assets[0].base64;
                const uri = response.assets[0].uri;
                setImageUri(uri);
                const fileName = uri.split('/').pop();
                const base64Image = `data:image/png;base64,${base64Data}`;
                const processedImageUri = await removeBackground(base64Image);
                if (processedImageUri) {
                    await uploadImageToSupabase(selectedItemType, fileName, processedImageUri);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while uploading the photo.');
        } finally {
            setLoading(false);
            console.log("Loading ended");
        }
    };

    const removeBackground = async (base64Image) => {
        try {
            const formData = new FormData();
            formData.append('image', { uri: base64Image, type: 'image/png', name: 'image.png' });
            // API call for background removal      // your IP address
            const response = await axios.post('http://192.168.1.184:5000/remove-background', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.status === 'success') {
                return `data:image/png;base64,${response.data.image}`;
            } else {
                Alert.alert('Error', 'Failed to remove background.');
                return null;
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while removing the background.');
            return null;
        }
    };

    const uploadImageToSupabase = async (itemType, fileName, processedImageUri) => {
        try {
            // Decode the base64 image data
            const decodedData = decode(processedImageUri.split(',')[1]);
    
            // Upload the image to the Supabase storage
            const { data, error } = await supabase.storage
                .from('uploads')
                .upload(`${itemType}/${fileName}`, decodedData, { contentType: 'image/png', cacheControl: '3600', upsert: false });
    
            if (error) {
                Alert.alert('Upload failed!', error.message);
                return;
            }
    
            // Now that the image is uploaded, insert the metadata into the respective table
            const imageUri = data?.path || ''; // Get the file path from the upload result
    
            const bucketFileID = data.id;

            let tableName = '';
            if (itemType === 'shirts') {
                tableName = 'shirts';
            } else if (itemType === 'pants') {
                tableName = 'pants';
            } else if (itemType === 'shoes') {
                tableName = 'shoes';
            }
    
            if (tableName) {
                const { data: insertData, error: insertError } = await supabase
                    .from(tableName)
                    .insert([
                        { id: bucketFileID, name: fileName, image_url: imageUri }
                    ]);
    
                if (insertError) {
                    Alert.alert('Error', 'Failed to insert into the database.');
                    console.log(insertError);
                } else {
                    Alert.alert('Upload successful!', `Your ${itemType} has been added.`);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while uploading the image.');
            console.log(error);
        }
    };
    

    return (
        <View style={[styles.container, {backgroundColor:theme}]}>
            {/* Loading overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="##800f2f" />
                    <Text style={[styles.loadingText, {color: theme.color}]}>Uploading...</Text>
                </View>
            )}

            <Text style={[styles.headerText, {color: theme.color}]}>Your closet is waiting for something new.</Text>
            <Text style={[styles.subText, {color: theme.color}]}>Tap to upload.</Text>

            {/* Tappable Images for Each Category */}
            <TouchableOpacity onPress={() => takePhoto('shirts')} style={styles.itemContainer}>
                <Image source={require('../uploads/shirt1.png')} style={styles.image} />
                <Text style={[styles.label, {color: theme.color}]}>Shirts</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => takePhoto('pants')} style={styles.itemContainer}>
                <Image source={require('../uploads/pant1.png')} style={styles.image} />
                <Text style={[styles.label, {color: theme.color}]}>Pants</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => takePhoto('shoes')} style={styles.itemContainer}>
                <Image source={require('../uploads/shoe2.png')} style={styles.image} />
                <Text style={[styles.label, {color: theme.color}]}>Shoes</Text>
            </TouchableOpacity>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
        backgroundColor: '#fff',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    headerText: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: -20,
        marginBottom: 2,
    },
    subText: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    itemContainer: {
        alignItems: 'center',
        marginTop: -30,
        marginVertical: 5,
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.70,
        shadowRadius: 3.84,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        marginTop: -10,
    },
    loadingText: {
        fontSize: 20,
        color: '#800f2f',
        marginTop: 10,
    },
});

export default UploadPage;