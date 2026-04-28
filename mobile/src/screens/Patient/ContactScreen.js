import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

const contactInfo = {
  address: {
    line1: '1st Phase',
    line2: 'Arkalgud, Hassan',
    country: 'INDIA',
  },
  phone: '91-7019220796',
  email: 'cnpramoda@gmail.com',
};

const ContactScreen = () => {
  const handlePhonePress = () => {
    Linking.openURL(`tel:${contactInfo.phone}`);
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactInfo.email}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            CONTACT <Text style={styles.highlight}>US</Text>
          </Text>
          <View style={styles.underline} />
          <Text style={styles.subtitle}>
            We'd love to hear from you. Reach out to our team for any inquiries or support.
          </Text>
        </View>

        {/* Contact Info Cards */}
        <View style={styles.cardsContainer}>
          {/* Office Address */}
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text style={styles.cardTitle}>OUR OFFICE</Text>
            <Text style={styles.cardText}>
              {contactInfo.address.line1}{'\n'}
              {contactInfo.address.line2}{'\n'}
              {contactInfo.address.country}
            </Text>
          </View>

          {/* Contact Info */}
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📞</Text>
            <Text style={styles.cardTitle}>CONTACT INFO</Text>
            <TouchableOpacity onPress={handlePhonePress}>
              <View style={styles.contactItem}>
                <View style={styles.contactDot} />
                <Text style={styles.contactText}>Tel: {contactInfo.phone}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEmailPress}>
              <View style={styles.contactItem}>
                <View style={styles.contactDot} />
                <Text style={styles.contactText}>Email: {contactInfo.email}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Careers */}
          <View style={styles.card}>
            <Text style={styles.cardIcon}>💼</Text>
            <Text style={styles.cardTitle}>CAREERS AT MEDIQ</Text>
            <Text style={styles.cardText}>
              Learn more about our teams and job openings.
            </Text>
            <TouchableOpacity style={styles.careerButton}>
              <Text style={styles.careerButtonText}>Explore Jobs →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  highlight: {
    color: '#3b82f6',
  },
  underline: {
    width: 96,
    height: 4,
    backgroundColor: '#3b82f6',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 600,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  contactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    opacity: 0.8,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
  },
  careerButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  careerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ContactScreen;

