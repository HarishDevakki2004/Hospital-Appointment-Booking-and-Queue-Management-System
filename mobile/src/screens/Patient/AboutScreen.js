import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

const AboutScreen = () => {
  const featureCards = [
    {
      title: 'EFFICIENCY',
      description: 'Streamlined appointment scheduling that fits into your busy lifestyle.',
      icon: '⏱️',
    },
    {
      title: 'CONVENIENCE',
      description: 'Access to a network of trusted healthcare professionals in your area.',
      icon: '🏥',
    },
    {
      title: 'PERSONALIZATION',
      description: 'Tailored recommendations and reminders to help you stay on top of your health.',
      icon: '✨',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            ABOUT <Text style={styles.highlight}>US</Text>
          </Text>
          <View style={styles.underline} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.paragraph}>
            Welcome to <Text style={styles.brand}>MediQ Mobile</Text>, your trusted partner in managing your healthcare needs conveniently and efficiently. At MediQ Mobile, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
          </Text>

          <Text style={styles.paragraph}>
            MediQ Mobile is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, MediQ Mobile is here to support you every step of the way.
          </Text>

          <View style={styles.visionCard}>
            <Text style={styles.visionTitle}>Our Vision</Text>
            <Text style={styles.visionText}>
              Our vision at MediQ Mobile is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>
            WHY <Text style={styles.highlight}>CHOOSE US</Text>
          </Text>

          <View style={styles.featuresGrid}>
            {featureCards.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f2b',
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
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  highlight: {
    color: '#67e8f9',
  },
  underline: {
    width: 96,
    height: 4,
    backgroundColor: '#22d3ee',
  },
  mainContent: {
    marginBottom: 40,
    gap: 16,
  },
  paragraph: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  brand: {
    color: '#67e8f9',
    fontWeight: '500',
  },
  visionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 16,
  },
  visionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#67e8f9',
    marginBottom: 12,
  },
  visionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  featuresSection: {
    marginTop: 40,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#67e8f9',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
});

export default AboutScreen;

