import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { API_BASE } from '../../config';
import { getDefaultAvatar } from '../../assets';

const AppointmentScreen = ({ navigation, route }) => {
  const { docId } = route.params;
  const { doctors, currencySymbol, token, getDoctorsData } = useContext(AppContext);
  
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [travelTime, setTravelTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookedToken, setBookedToken] = useState(null);

  const shortDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  useEffect(() => {
    if (doctors.length > 0) {
      const doc = doctors.find((d) => d._id === docId);
      if (doc) {
        setDocInfo(doc);
        getAvailableSlots(doc);
      }
    }
  }, [doctors, docId]);

  const getAvailableSlots = async (docInfo) => {
    setIsLoading(true);
    setDocSlots([]);

    // Check if slots_booked exists, if not initialize it
    if (!docInfo.slots_booked) {
      docInfo.slots_booked = {};
    }

    let today = new Date();
    let slotsArray = [];

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();
        const slotDate = day + '_' + month + '_' + year;
        const slotTime = formattedTime;

        // Safely check if slot is booked
        const isSlotAvailable =
          docInfo.slots_booked && 
          docInfo.slots_booked[slotDate] &&
          Array.isArray(docInfo.slots_booked[slotDate]) &&
          docInfo.slots_booked[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      slotsArray.push(timeSlots);
    }

    setDocSlots(slotsArray);
    setIsLoading(false);
  };

  const bookAppointment = async () => {
    if (!token) {
      Alert.alert('Warning', 'Please login to book an appointment');
      return navigation.navigate('PatientLogin');
    }

    if (!slotTime) {
      Alert.alert('Warning', 'Please select a time slot');
      return;
    }

    const finalTravelTime = travelTime || 15;
    setBookingStatus('processing');

    const date = docSlots[slotIndex][0].datetime;
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    const slotDate = day + '_' + month + '_' + year;

    try {
      const { data } = await axios.post(
        API_BASE + '/api/user/book-appointment',
        { docId, slotDate, slotTime, travelTime: finalTravelTime },
        { headers: { token } }
      );

      if (data.success) {
        setBookingStatus('success');
        setBookedToken(data.appointment);
        Alert.alert(
          'Success',
          `Your token is #${data.appointment.tokenNumber}. Travel time: ${finalTravelTime} minutes.`
        );
        setTimeout(() => {
          getDoctorsData();
          // Navigate to Appointments tab using CommonActions
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'PatientTabs',
                  state: {
                    routes: [
                      { name: 'Home' },
                      { name: 'Doctors' },
                      { name: 'Appointments' },
                      { name: 'Profile' },
                    ],
                    index: 2, // Appointments is at index 2
                  },
                },
              ],
            })
          );
        }, 2000);
      } else {
        setBookingStatus(null);
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      setBookingStatus(null);
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Booking failed');
    }
  };

  if (!docInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Doctor Profile Section */}
      <View style={styles.doctorSection}>
        <Image 
          source={docInfo.image ? { uri: docInfo.image } : getDefaultAvatar()} 
          style={styles.doctorImage} 
        />
        
        <View style={styles.doctorInfo}>
          <View style={styles.doctorHeader}>
            <View style={styles.doctorNameRow}>
              <Text style={styles.doctorName}>{docInfo.name}</Text>
            </View>
            <Text style={styles.doctorDegree}>
              {docInfo.degree} - {docInfo.speciality}
            </Text>
            <View style={styles.experienceBadge}>
              <Text style={styles.experienceText}>{docInfo.experience} years exp</Text>
            </View>
          </View>

          <View style={styles.feesContainer}>
            <Text style={styles.feesText}>
              {currencySymbol}{docInfo.fees}
            </Text>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>About Doctor</Text>
            <Text style={styles.aboutText}>{docInfo.about}</Text>
          </View>
        </View>
      </View>

      {/* Booking Section */}
      <View style={styles.bookingSection}>
        <Text style={styles.sectionTitle}>Book Appointment</Text>

        {/* Date Selection */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionSubtitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {docSlots.length > 0 &&
              docSlots.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSlotIndex(index)}
                  style={[
                    styles.dateCard,
                    slotIndex === index && styles.dateCardActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      slotIndex === index && styles.dateDayActive,
                    ]}
                  >
                    {shortDays[item[0]?.datetime.getDay()]}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumber,
                      slotIndex === index && styles.dateNumberActive,
                    ]}
                  >
                    {item[0]?.datetime.getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {/* Time Slot Selection */}
        <View style={styles.timeSection}>
          <Text style={styles.sectionSubtitle}>Available Time Slots</Text>
          {isLoading ? (
            <View style={styles.loadingSlots}>
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : docSlots[slotIndex]?.length > 0 ? (
            <View style={styles.timeSlotsGrid}>
              {docSlots[slotIndex].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSlotTime(item.time)}
                  style={[
                    styles.timeSlot,
                    item.time === slotTime && styles.timeSlotActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      item.time === slotTime && styles.timeSlotTextActive,
                    ]}
                  >
                    {item.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noSlotsContainer}>
              <Text style={styles.noSlotsText}>No available slots for this day</Text>
            </View>
          )}
        </View>

        {/* Book Button */}
        {slotTime && (
          <TouchableOpacity
            onPress={bookAppointment}
            disabled={bookingStatus === 'processing'}
            style={[
              styles.bookButton,
              bookingStatus === 'processing' && styles.bookButtonDisabled,
            ]}
          >
            {bookingStatus === 'processing' ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : bookingStatus === 'success' ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>Booked Successfully!</Text>
                {bookedToken && (
                  <Text style={styles.tokenText}>
                    Token #{bookedToken.tokenNumber}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.bookButtonText}>
                Book Appointment for {slotTime}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  doctorSection: {
    padding: 16,
  },
  doctorImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
  },
  doctorInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  doctorHeader: {
    marginBottom: 16,
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  doctorDegree: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  experienceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  experienceText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  feesContainer: {
    backgroundColor: '#ecfeff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0891b2',
  },
  aboutSection: {
    marginTop: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  bookingSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  dateCard: {
    minWidth: 80,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    marginRight: 12,
  },
  dateCardActive: {
    backgroundColor: '#3b82f6',
  },
  dateDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  dateDayActive: {
    color: '#ffffff',
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dateNumberActive: {
    color: '#ffffff',
  },
  timeSection: {
    marginBottom: 24,
  },
  loadingSlots: {
    padding: 32,
    alignItems: 'center',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotActive: {
    backgroundColor: '#3b82f6',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: '#ffffff',
  },
  noSlotsContainer: {
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  noSlotsText: {
    color: '#92400e',
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  bookButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tokenText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
});

export default AppointmentScreen;

