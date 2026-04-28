import React, { useContext, useState, useEffect, useRef } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { API_BASE } from '../../config';
import { getDefaultAvatar } from '../../assets';

const MyProfileScreen = ({ navigation }) => {
  const { userData, token, setToken, loadUserProfileData, userId } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: { line1: '', line2: '' },
    gender: '',
    dob: '',
  });
  const [avatarUri, setAvatarUri] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      const initialData = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || { line1: '', line2: '' },
        gender: userData.gender || '',
        dob: userData.dob || '',
      };
      setFormData(initialData);
      setOriginalData(initialData);
      setAvatarUri(userData.image || null);
    }
  }, [userData]);

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim() === '') {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') {
      return 'Phone is required';
    }
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  };

  const validateEmail = (email) => {
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return 'Please enter a valid email';
      }
    }
    return null;
  };

  const validateDOB = (dob) => {
    if (dob) {
      const dobDate = new Date(dob);
      const today = new Date();
      if (isNaN(dobDate.getTime())) {
        return 'Please enter a valid date (YYYY-MM-DD)';
      }
      if (dobDate > today) {
        return 'Date of birth cannot be in the future';
      }
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const dobError = validateDOB(formData.dob);
    if (dobError) newErrors.dob = dobError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image picker
  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        // Telemetry
        console.log('profile_edit_opened: avatar_selected');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle update with optimistic UI
  const handleUpdate = async () => {
    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    try {
      setLoading(true);
      // Telemetry
      console.log('profile_edit_opened: save_attempted');

      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('phone', formData.phone.trim());
      if (formData.email) formDataToSend.append('email', formData.email.trim());
      if (formData.dob) formDataToSend.append('dob', formData.dob);
      if (formData.gender) formDataToSend.append('gender', formData.gender);
      formDataToSend.append('address', JSON.stringify(formData.address));

      // Handle image upload if changed
      if (avatarUri && avatarUri !== userData?.image) {
        setUploading(true);
        // Telemetry
        console.log('avatar_upload_started');
        
        const filename = avatarUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formDataToSend.append('image', {
          uri: Platform.OS === 'ios' ? avatarUri.replace('file://', '') : avatarUri,
          name: filename || 'avatar.jpg',
          type: type,
        });
      }

      // Optimistic update - save original data for rollback
      const previousData = { ...userData };
      const previousAvatar = userData?.image;

      // Ensure token is available
      if (!token) {
        Alert.alert('Error', 'Authentication token is missing. Please login again.');
        setToken(null);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
        return;
      }

      // Make API call
      const { data } = await axios.post(
        `${API_BASE}/api/user/update-profile`,
        formDataToSend,
        {
          headers: {
            token,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (data.success) {
        // Telemetry
        console.log('profile_saved_success');
        if (avatarUri && avatarUri !== userData?.image) {
          console.log('avatar_upload_succeeded');
        }

        // Update local state
        await loadUserProfileData();
        setIsEditing(false);
        setErrors({});
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      // Telemetry
      console.log('profile_saved_failed', { error: error.message });

      // Handle specific error cases
      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => {
                setToken(null);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              },
            },
          ]
        );
        return;
      }

      if (error.response?.status === 422) {
        // Validation errors from backend
        const backendErrors = error.response.data.errors || {};
        setErrors(backendErrors);
        Alert.alert('Validation Error', 'Please check the form for errors.');
        return;
      }

      if (error.response?.status === 413) {
        Alert.alert(
          'File Too Large',
          'The image is too large. Please choose a smaller image or crop it.',
          [
            {
              text: 'Retry',
              onPress: () => pickImage(),
            },
            { text: 'Cancel' },
          ]
        );
        return;
      }

      if (!error.response) {
        // Network error
        Alert.alert(
          'Network Error',
          'Unable to update profile. Please check your connection and try again.',
          [
            {
              text: 'Retry',
              onPress: () => handleUpdate(),
            },
            { text: 'Cancel' },
          ]
        );
        return;
      }

      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    // Revert to original data
    if (originalData) {
      setFormData(originalData);
    }
    setAvatarUri(userData?.image || null);
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          setToken(null);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        },
      },
    ]);
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={isEditing ? pickImage : undefined} disabled={!isEditing}>
          <Image
            source={avatarUri ? { uri: avatarUri } : userData.image ? { uri: userData.image } : getDefaultAvatar()}
            style={[styles.profileImage, isEditing && styles.profileImageEditable]}
          />
          {isEditing && (
            <View style={styles.editImageOverlay}>
              <Text style={styles.editImageText}>📷</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.profileName}>{userData.name}</Text>
        <Text style={styles.profileEmail}>{userData.email}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            {isEditing ? (
              <>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) {
                      setErrors({ ...errors, name: null });
                    }
                  }}
                  placeholder="Enter your name"
                  accessibilityLabel="Name input"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </>
            ) : (
              <Text style={styles.value}>{userData.name}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            {isEditing ? (
              <>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) {
                      setErrors({ ...errors, email: null });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  accessibilityLabel="Email input"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </>
            ) : (
              <Text style={styles.value}>{userData.email || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone *</Text>
            {isEditing ? (
              <>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={formData.phone}
                  onChangeText={(text) => {
                    setFormData({ ...formData, phone: text });
                    if (errors.phone) {
                      setErrors({ ...errors, phone: null });
                    }
                  }}
                  keyboardType="phone-pad"
                  placeholder="Enter your phone number"
                  accessibilityLabel="Phone input"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </>
            ) : (
              <Text style={styles.value}>{userData.phone || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.gender}
                onChangeText={(text) => setFormData({ ...formData, gender: text })}
                placeholder="Male/Female/Other"
                accessibilityLabel="Gender input"
              />
            ) : (
              <Text style={styles.value}>{userData.gender || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            {isEditing ? (
              <>
                <TextInput
                  style={[styles.input, errors.dob && styles.inputError]}
                  value={formData.dob}
                  onChangeText={(text) => {
                    setFormData({ ...formData, dob: text });
                    if (errors.dob) {
                      setErrors({ ...errors, dob: null });
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                  accessibilityLabel="Date of birth input"
                />
                {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
              </>
            ) : (
              <Text style={styles.value}>{userData.dob || 'Not set'}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={formData.address?.line1 || ''}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, line1: text },
                  })
                }
                placeholder="Address Line 1"
                accessibilityLabel="Address line 1 input"
              />
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                value={formData.address?.line2 || ''}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, line2: text },
                  })
                }
                placeholder="Address Line 2"
                accessibilityLabel="Address line 2 input"
              />
            </>
          ) : (
            <Text style={styles.value}>
              {userData.address?.line1 || 'Not set'}
              {userData.address?.line2 && `\n${userData.address.line2}`}
            </Text>
          )}
        </View>

        {/* View Appointments Button */}
        <TouchableOpacity
          style={styles.viewAppointmentsButton}
          onPress={() => navigation.navigate('ProfileAppointments')}
          accessibilityLabel="View your appointment history"
          accessibilityRole="button"
        >
          <Text style={styles.viewAppointmentsIcon}>📅</Text>
          <View style={styles.viewAppointmentsTextContainer}>
            <Text style={styles.viewAppointmentsTitle}>View Appointments</Text>
            <Text style={styles.viewAppointmentsSubtitle}>See your past visits & history</Text>
          </View>
          <Text style={styles.viewAppointmentsArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.saveButton, (loading || uploading) && styles.buttonDisabled]}
                onPress={handleUpdate}
                disabled={loading || uploading}
                accessibilityLabel="Save profile changes"
                accessibilityRole="button"
              >
                {loading || uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {uploading ? 'Uploading...' : 'Save Changes'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={loading || uploading}
                accessibilityLabel="Cancel editing"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setIsEditing(true);
                // Telemetry
                console.log('profile_edit_opened');
              }}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#3b82f6',
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
  profileImageEditable: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: '50%',
    marginRight: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageText: {
    fontSize: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#dbeafe',
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
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
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
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  viewAppointmentsButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  viewAppointmentsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  viewAppointmentsTextContainer: {
    flex: 1,
  },
  viewAppointmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  viewAppointmentsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewAppointmentsArrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
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
    minHeight: 52,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyProfileScreen;
