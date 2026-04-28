import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { DoctorContext } from '../../context/DoctorContext';
import axios from 'axios';
import { API_BASE } from '../../config';
import { getDefaultAvatar } from '../../assets';

const DoctorProfileScreen = ({ navigation }) => {
  const { profileData, getProfileData, dToken } = useContext(DoctorContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    fees: '',
    about: '',
    address: { line1: '', line2: '' },
    available: true,
  });
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (profileData) {
      console.log('=== FRONTEND: Profile data changed ===');
      console.log('Full profileData:', JSON.stringify(profileData, null, 2));
      console.log('Phone from profileData:', profileData.phone);
      console.log('Phone type:', typeof profileData.phone);
      
      const initialData = {
        phone: profileData.phone || '',
        fees: profileData.fees?.toString() || '',
        about: profileData.about || '',
        address: profileData.address || { line1: '', line2: '' },
        available: profileData.available !== undefined ? profileData.available : true,
      };
      
      console.log('Setting formData to:', JSON.stringify(initialData, null, 2));
      console.log('Phone in formData:', initialData.phone);
      
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [profileData]);

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const handleUpdate = async () => {
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        phone: formData.phone.trim(),
        fees: parseFloat(formData.fees) || 0,
        about: formData.about.trim(),
        address: formData.address,
        available: formData.available,
      };

      console.log('=== FRONTEND: Sending update request ===');
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      console.log('Phone value being sent:', updateData.phone);
      console.log('Phone type:', typeof updateData.phone);
      
      const { data } = await axios.post(
        `${API_BASE}/api/doctor/update-profile`,
        updateData,
        { headers: { dToken } }
      );

      console.log('=== FRONTEND: Update response ===');
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('Phone in response:', data.profileData?.phone);

      if (data.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
        // Update profile data immediately if returned from server
        if (data.profileData) {
          console.log('Updating profileData with:', data.profileData);
          console.log('Phone in returned data:', data.profileData.phone);
          setProfileData(data.profileData);
          // Also update formData directly to ensure UI updates
          setFormData(prev => ({
            ...prev,
            phone: data.profileData.phone || '',
          }));
        }
        // Also refresh from server to ensure consistency
        setTimeout(() => {
          getProfileData();
        }, 500);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditing(false);
  };

  if (!profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={profileData.image ? { uri: profileData.image } : getDefaultAvatar()}
          style={styles.profileImage}
          defaultSource={getDefaultAvatar()}
        />
        <Text style={styles.profileName}>{profileData.name}</Text>
        <Text style={styles.profileSpeciality}>{profileData.speciality}</Text>
      </View>

      <View style={styles.content}>
        {/* Phone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>
              {formData.phone || profileData?.phone || 'Not provided'}
            </Text>
          )}
        </View>

        {/* Fees Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Fee</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.fees}
              onChangeText={(text) => setFormData({ ...formData, fees: text })}
              placeholder="Enter consultation fee"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>₹{formData.fees || '0'}</Text>
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.about}
              onChangeText={(text) => setFormData({ ...formData, about: text })}
              placeholder="Enter about information"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.value}>{formData.about || 'Not provided'}</Text>
          )}
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          {isEditing ? (
            <>
              <TextInput
                style={[styles.input, { marginBottom: 12 }]}
                value={formData.address.line1}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, line1: text },
                  })
                }
                placeholder="Address line 1"
              />
              <TextInput
                style={styles.input}
                value={formData.address.line2}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, line2: text },
                  })
                }
                placeholder="Address line 2"
              />
            </>
          ) : (
            <Text style={styles.value}>
              {formData.address.line1 || 'Not provided'}
              {formData.address.line2 ? `\n${formData.address.line2}` : ''}
            </Text>
          )}
        </View>

        {/* Availability Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          {isEditing ? (
            <TouchableOpacity
              style={[
                styles.availabilityButton,
                formData.available && styles.availabilityButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, available: !formData.available })}
            >
              <View
                style={[
                  styles.availabilityIndicator,
                  formData.available && styles.availabilityIndicatorActive,
                ]}
              />
              <Text style={styles.availabilityText}>
                {formData.available ? 'Available' : 'Not Available'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.availabilityDisplay}>
              <View
                style={[
                  styles.availabilityIndicator,
                  formData.available && styles.availabilityIndicatorActive,
                ]}
              />
              <Text style={styles.value}>
                {formData.available ? 'Available' : 'Not Available'}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#10b981',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileSpeciality: {
    fontSize: 16,
    color: '#d1fae5',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  availabilityButtonActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
  availabilityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  availabilityIndicatorActive: {
    backgroundColor: '#10b981',
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  actions: {
    marginTop: 8,
    marginBottom: 32,
  },
  editButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default DoctorProfileScreen;

