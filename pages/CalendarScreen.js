import React, { useState, useRef, useEffect, useContext } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  Text,
  Image,
} from 'react-native';
import moment from 'moment';
import Swiper from 'react-native-swiper';
import supabase from './supabase-service';
import themeContext from '../theme/themeContext';


const SUPABASE_STORAGE_URL = "https://jnwydjjsvdkifjnbmkzk.supabase.co/storage/v1/object/public/uploads/";
const { width } = Dimensions.get('window');

const CalendarScreen = ({ route }) => {
  const { selected } = route.params || {};
  const swiper = useRef();
  const [value, setValue] = useState(selected ? new Date(selected) : new Date());
  const [week, setWeek] = useState(0);
  const [outfit, setOutfit] = useState(null); // State to hold the outfit data
  const [currentItemIndex, setCurrentItemIndex] = useState(0); // State for currently visible outfit part
  const theme = useContext(themeContext);


  const weeks = React.useMemo(() => {
    const start = moment().add(week, 'weeks').startOf('week');

    return [-1, 0, 1].map(adj => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day');
        return {
          weekday: date.format('ddd'),
          date: date.toDate(),
        };
      });
    });
  }, [week]);

  useEffect(() => {
    const fetchOutfit = async () => {
      console.log('Fetching outfit for date:', value); // Log the date being queried
      const startOfDay = moment(value).startOf('day').toISOString();
      const endOfDay = moment(value).endOf('day').toISOString();

      try {
        const { data, error } = await supabase
          .from('event_dates')
          .select(`
            event_date,
            calendar_events (
              shirts (
                name, image_url
              ),
              pants (
                name, image_url
              ),
              shoes (
                name, image_url
              )
            )
          `)
          .gte('event_date', startOfDay)
          .lte('event_date', endOfDay);

        if (error) {
          console.error('Error fetching outfit:', error);
          setOutfit(null);
        } else {
          console.log('Outfit data received:', data); // Log the data received

          if (data.length > 0) {
            const event = data[0].calendar_events;

            // Log each part of the outfit explicitly
            console.log('Shirt data:', event.shirts);
            console.log('Pants data:', event.pants);
            console.log('Shoes data:', event.shoes);

            setOutfit({
              shirt: event.shirts,
              pants: event.pants,
              shoes: event.shoes,
            });
          } else {
            console.log('No outfit found for this date.');
            setOutfit(null); // No outfit for this date
          }
        }
      } catch (fetchError) {
        console.error('Unexpected error fetching outfit:', fetchError);
      }
    };

    fetchOutfit();
  }, [value]);


  // Cache-busting function to prevent cached images
  const generateCacheBuster = () => `?t=${new Date().getTime()}`;

  const outfitItems = [
    { label: 'Shirt', data: outfit?.shirt },
    { label: 'Pants', data: outfit?.pants },
    { label: 'Shoes', data: outfit?.shoes },
  ];

  // Navigation handlers
  const handleNext = () => {
    console.log('Navigating to next outfit item');
    setCurrentItemIndex((prevIndex) => (prevIndex + 1) % outfitItems.length);
  };

  const handlePrevious = () => {
    console.log('Navigating to previous outfit item');
    setCurrentItemIndex((prevIndex) =>
      prevIndex === 0 ? outfitItems.length - 1 : prevIndex - 1
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container, {color: theme.background}]}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.color}]}>Your Fits</Text>
        </View>
        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
              if (ind === 1) return;
              setTimeout(() => {
                const newIndex = ind - 1;
                const newWeek = week + newIndex;
                setWeek(newWeek);
                setValue(moment(value).add(newIndex, 'week').toDate());
                swiper.current.scrollTo(1, false);
              }, 100);
            }}
          >
            {weeks.map((dates, index) => (
              <View style={styles.itemRow} key={index}>
                {dates.map((item, dateIndex) => {
                  const isActive =
                    value.toDateString() === item.date.toDateString();
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => setValue(item.date)}
                    >
                      <View
                        style={[
                          styles.item,
                          isActive && {
                           backgroundColor: theme.color
                          }, {borderColor: theme.color}
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemWeekday,
                            isActive && { color: '#800f2f' },
                          ]}
                        >
                          {item.weekday}
                        </Text>
                        <Text
                          style={[
                            styles.itemDate, {color: theme.color},
                            isActive && { color: theme.background },
                          ]}
                        >
                          {item.date.getDate()}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
          <Text style={styles.subtitle}>{value.toDateString()}</Text>
          <View style={[styles.placeholder, {backgroundColor: theme.backgroundColor}]}>
            <View style={styles.placeholderInset}>
              {outfit ? (
                <>
                  <View style={styles.navContainer}>
                    <Text style={[styles.outfitLabel, {color: theme.color}]}>
                      {outfitItems[currentItemIndex].label}
                    </Text>
                    <View style={styles.navArrows}>
                      <Text onPress={handlePrevious} style={[styles.arrow, {color: theme.color}]}>
                        ←
                      </Text>
                      <Text onPress={handleNext} style={[styles.arrow, {color: theme.color}]}>
                        →
                      </Text>
                    </View>
                  </View>
                  {outfitItems[currentItemIndex]?.data?.image_url ? (
                    // Log the image URL
                    console.log("Image URL:", SUPABASE_STORAGE_URL + outfitItems[currentItemIndex]?.data?.image_url + generateCacheBuster()),
                    <Image
                      source={{
                        uri: SUPABASE_STORAGE_URL + outfitItems[currentItemIndex]?.data?.image_url + generateCacheBuster(),
                      }}
                      style={styles.outfitImage}
                      resizeMode="contain"
                      onLoad={() => console.log('Image loaded successfully')}
                      onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
                      onLayout={() => console.log('Image layout completed')}
                    />

                  ) : (
                    <Text style={styles.noOutfitText}>
                      No {outfitItems[currentItemIndex].label.toLowerCase()} saved for this date
                    </Text>
                  )}

                </>
              ) : (
                <Text style={[styles.noOutfitText, {color: theme.color}]}>
                  No outfit saved for this date
                </Text>
              )}

            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#800f2f',
    marginBottom: 12,
  },
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: '500',
    color: '#800f2f',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemRow: {
    width: width,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  placeholder: {
    flex: 1,
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#800f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInset: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  navContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  outfitLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 8,
  },
  navArrows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%', // Ensures the arrows take up the full width
    paddingHorizontal: 40, // Add more space between the arrows
  },
  arrow: {
    fontSize: 24,
    color: '#111',
  },
  noOutfitText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
});

export default CalendarScreen;