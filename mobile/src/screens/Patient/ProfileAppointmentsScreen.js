import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { API_BASE } from '../../config';
import { getDefaultAvatar } from '../../assets';

const FILTERS = {
  ALL: 'all',
  PAST: 'past',
  CANCELLED: 'cancelled',
};

const ProfileAppointmentsScreen = ({ navigation }) => {
  const { token, userId } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(FILTERS.PAST);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchAppointments = useCallback(async (pageNum = 1, filter = activeFilter, append = false) => {
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const { data } = await axios.get(
        `${API_BASE}/api/user/appointments/history`,
        {
          params: {
            page: pageNum,
            pageSize: 20,
            filter,
          },
          headers: { token },
          timeout: 10000,
        }
      );

      if (data.success) {
        if (append) {
          setAppointments((prev) => [...prev, ...data.items]);
        } else {
          setAppointments(data.items);
        }
        setTotal(data.total);
        setHasMore(data.items.length === 20 && data.items.length < data.total);
        setPage(pageNum);
      } else {
        throw new Error(data.message || 'Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      } else {
        Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to load appointments');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [token, activeFilter, navigation]);

  useEffect(() => {
    fetchAppointments(1, activeFilter, false);
  }, [activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchAppointments(1, activeFilter, false);
  }, [fetchAppointments, activeFilter]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchAppointments(page + 1, activeFilter, true);
    }
  }, [loadingMore, hasMore, loading, page, activeFilter, fetchAppointments]);

  const handleAppointmentPress = async (appointmentId) => {
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/user/appointments/${appointmentId}`,
        { headers: { token } }
      );

      if (data.success) {
        // Navigate to details screen - pass appointment object directly
        navigation.navigate('AppointmentDetails', { appointment: data.appointment });
      } else {
        Alert.alert('Error', data.message || 'Failed to load appointment details');
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      Alert.alert('Error', 'Failed to load appointment details');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'in_progress':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Booked';
    }
  };

  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => handleAppointmentPress(item.appointmentId)}
      accessibilityLabel={`Appointment with ${item.doctorName} on ${formatDate(item.date)}`}
      accessibilityRole="button"
    >
      <View style={styles.cardHeader}>
        <Image
          source={
            item.doctorImage
              ? { uri: item.doctorImage }
              : getDefaultAvatar()
          }
          style={styles.doctorImage}
          defaultSource={getDefaultAvatar()}
        />
        <View style={styles.cardHeaderText}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {item.doctorName}
          </Text>
          <Text style={styles.specialization} numberOfLines={1}>
            {item.specialization}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Token:</Text>
          <Text style={styles.infoValue}>{item.tokenNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>
            {formatDate(item.date)} {item.timeFormatted && `• ${item.timeFormatted}`}
          </Text>
        </View>
        {item.hospital?.name && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hospital:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {item.hospital.name}
            </Text>
          </View>
        )}
        {item.amount > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount:</Text>
            <Text style={styles.infoValue}>
              ₹{item.amount} {item.payment ? '✓ Paid' : ''}
            </Text>
          </View>
        )}
      </View>

      {(item.prescriptionUrl || item.invoiceUrl) && (
        <View style={styles.cardActions}>
          {item.prescriptionUrl && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Handle prescription view
                Alert.alert('Prescription', 'Prescription viewing will be implemented');
              }}
            >
              <Text style={styles.actionButtonText}>📄 Prescription</Text>
            </TouchableOpacity>
          )}
          {item.invoiceUrl && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Handle invoice download
                Alert.alert('Invoice', 'Invoice download will be implemented');
              }}
            >
              <Text style={styles.actionButtonText}>📥 Invoice</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>No Appointments Found</Text>
      <Text style={styles.emptyText}>
        {activeFilter === FILTERS.CANCELLED
          ? 'You have no cancelled appointments.'
          : activeFilter === FILTERS.PAST
          ? 'You have no past appointments yet.'
          : 'You have no appointments yet.'}
      </Text>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('Doctors')}
        accessibilityLabel="Book an appointment"
        accessibilityRole="button"
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {Object.values(FILTERS).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => {
              setActiveFilter(filter);
              setPage(1);
              setHasMore(true);
            }}
            accessibilityLabel={`Show ${filter} appointments`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Appointments List */}
      {loading && appointments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : appointments.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.appointmentId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
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
  list: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default ProfileAppointmentsScreen;

