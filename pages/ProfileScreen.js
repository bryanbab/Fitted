import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as MediaLibrary from 'expo-media-library';
import { EventRegister } from 'react-native-event-listeners';
import themeContext from '../theme/themeContext';


const SECTIONS = [
  {
    header: 'PREFERENCES',
    items: [
      { id: 'language', icon: 'globe', label: 'Language', type: 'select' },
      { id: 'darkMode', icon: 'moon', label: 'Dark Mode', type: 'toggle' },
      { id: 'wifi', icon: 'wifi', label: 'Use Wi-Fi', type: 'toggle', color: '#800f2f' },
    ],
  },
  {
    header: 'HELP',
    items: [
      { id: 'bug', icon: 'flag', label: 'Report Bug', type: 'link' },
      { id: 'contact', icon: 'mail', label: 'Contact Us', type: 'link' },
    ],
  },
  {
    header: 'CONTENT',
    items: [
      { id: 'save', icon: 'upload', label: 'Share', type: 'link' },
      { id: 'download', icon: 'download', label: 'Download', type: 'link' },
    ],
  },

];
function ProfileScreen() {
  const [form, setForm] = useState({
    language: 'English',
    darkMode: true,
    wifi: false
  })
  const theme = useContext(themeContext)
  const[darkMode, setDarkMode] = useState(false)
  const currentTheme = useContext(themeContext)
  return (
    <ScrollView
      vertical
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}>

      {/* Profile Section */}
      <View style={[styles.profile, {backgroundColor: theme.backgroundColor}]}>
        <Image
          alt=""
          source={{
            uri: 'https://avatars.githubusercontent.com/u/131295938?s=200&v=4',
          }}
          style={styles.profileAvatar}
        />
        <Text style={[styles.profileName, {color: theme.color}]}>Your Name</Text>
        <Text style={[styles.profileEmail, {color: theme.color}]}>your.name@mail.com</Text>
        <TouchableOpacity
          onPress={() => {
            // handle onPress
          }}>
          <View style={[styles.profileAction,currentTheme.backgroundColor]}>
            <Text style={[styles.profileActionText, currentTheme.profileActionText]}>Edit Profile</Text>
            <FeatherIcon color="#fff" name="edit" size={16} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Sections */}
      {SECTIONS.map(({ header, items }) => (
        <View style={styles.section} key={header}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{header}</Text>
          </View>
          <View style={styles.sectionBody}>
            {items.map(({ label, id, type, icon }, index) => (
              <View style={[styles.rowWrapper, {backgroundColor: theme.backgroundColor}, index === 0 && { borderTopWidth: 0 }]} key={id}>
                <TouchableOpacity onPress={() => { }}>
                  <View style={styles.row}>
                    <FeatherIcon name={icon} color={'#a7a7a7'} size={22} style={{ marginRight: 12 }} />
                    <Text style={[styles.rowLabel, {color:theme.color}]}>{label}</Text>
                    <View style={styles.rowSpacer} />
                    {type === 'select' && <Text style={[styles.rowValue, {color: theme.color}]}>{form[id]}</Text>}
                    {id === 'darkMode' &&(
                      <Switch
                        value={darkMode}
                        onValueChange={(value) => {setDarkMode(value);
                          EventRegister.emit('ChangeTheme', value)
                        }}
                        trackColor={{ false: '#767577', true: '#800f2f' }}
                      />
                    )}
                    {id === 'wifi' && (
                      <Switch
                        value={form[id]}
                        onValueChange={(value) => setForm({ ...form, [id]: value })}
                        trackColor={{ false: '#767577', true: '#800f2f' }}
                      />
                    )}
                    
                    {['select', 'link'].includes(type) && (
                      <FeatherIcon name="chevron-right" color="#ababab" size={22} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 0
  },
  
  header: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  section: {
    paddingTop: 12,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a7a7a7',
    letterSpacing: 1.2,
  },
  rowWrapper: {
    paddingLeft: 24,
    borderTopWidth: 1,
    borderColor: '#e3e3e3',
    backgroundColor: '#fff',    
   
  },
  row: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 24,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000'
  },
  rowSpacer: {
    flex: 1
  },
  rowValue: {
    fontSize: 17,
    color: '#616161',
    marginRight: 4,
  },
  profile: {
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 150,
  },
  profileName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#090909',
  },
  profileEmail: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '400',
    color: '#848484',
  },
  profileAction: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#800f2f',
    borderRadius: 12,
  },
  profileActionText: {
    marginRight: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

})
export default ProfileScreen;

