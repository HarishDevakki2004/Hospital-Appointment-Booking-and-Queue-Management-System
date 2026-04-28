import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { review1, review2, review3, getImageSource } from '../assets';

const reviews = [
  {
    id: 1,
    image: review1,
    name: 'John Doe',
    review: 'This app is amazing! The UI is sleek, and booking appointments is seamless. Highly recommended!',
    rating: 5,
  },
  {
    id: 2,
    image: review2,
    name: 'Jane Smith',
    review: 'Great service and user-friendly design. Navigating through the app was smooth and hassle-free!',
    rating: 5,
  },
  {
    id: 3,
    image: review3,
    name: 'Michael Lee',
    review: 'Absolutely love the features on this platform. A must-have app for everyone!',
    rating: 5,
  },
];

const Reviews = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prevReview = () => {
    setIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const currentReview = reviews[index];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What Our Patients Say</Text>
      <View style={styles.reviewContainer}>
        <View style={styles.reviewCard}>
          <Text style={styles.quote}>❝</Text>
          <Text style={styles.reviewText}>{currentReview.review}</Text>
          <View style={styles.reviewFooter}>
            <Image
              source={getImageSource(currentReview.image) || { uri: 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <View style={styles.reviewInfo}>
              <Text style={styles.reviewName}>{currentReview.name}</Text>
              <View style={styles.stars}>
                {[...Array(currentReview.rating)].map((_, i) => (
                  <Text key={i} style={styles.star}>⭐</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.button}
            onPress={prevReview}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.indicators}>
            {reviews.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.indicator,
                  i === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={nextReview}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  reviewContainer: {
    alignItems: 'center',
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quote: {
    fontSize: 32,
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  reviewInfo: {
    alignItems: 'flex-start',
  },
  reviewName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  button: {
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: 'bold',
  },
  indicators: {
    flexDirection: 'row',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  indicatorActive: {
    backgroundColor: '#3b82f6',
    width: 20,
  },
});

export default Reviews;
