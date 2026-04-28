import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
import { API_BASE } from '../config';
import { RAZORPAY_KEY_ID } from '../config';

// Conditionally import WebView
let WebView = null;
try {
  WebView = require('react-native-webview').WebView;
} catch (error) {
  console.log('react-native-webview not available');
}

const RazorpayPaymentModal = ({ visible, onClose, appointment, token, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [checkoutHTML, setCheckoutHTML] = useState('');
  const webViewRef = useRef(null);

  useEffect(() => {
    if (visible && appointment && token) {
      initializePayment();
    } else {
      setOrder(null);
      setCheckoutHTML('');
    }
  }, [visible, appointment, token]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      
      // Step 1: Create Razorpay order (same as frontend)
      const { data } = await axios.post(
        `${API_BASE}/api/user/payment-razorpay`,
        { appointmentId: appointment._id },
        { headers: { token } }
      );

      if (!data.success || !data.order) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      const orderData = data.order;
      setOrder(orderData);

      // Step 2: Generate Razorpay checkout HTML (same as frontend initPay)
      const razorpayKeyId = RAZORPAY_KEY_ID;
      
      if (!razorpayKeyId) {
        throw new Error('Razorpay is not configured. Please contact support.');
      }

      const html = generateRazorpayCheckoutHTML(
        razorpayKeyId,
        orderData,
        appointment._id
      );

      setCheckoutHTML(html);
      
      // Emit telemetry
      console.log('payment_attempt', {
        appointmentId: appointment._id,
        orderId: orderData.id,
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert(
        'Payment Error',
        error.response?.data?.message || error.message || 'Failed to initialize payment'
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const generateRazorpayCheckoutHTML = (keyId, orderData, appointmentId) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Razorpay Payment</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f3f4f6;
    }
    .container {
      text-align: center;
      padding: 20px;
    }
    .loading {
      font-size: 16px;
      color: #6b7280;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="loading">Loading payment gateway...</div>
  </div>
  <script>
    (function() {
      try {
        const options = {
          key: "${keyId}",
          amount: ${orderData.amount},
          currency: "${orderData.currency}",
          name: "MediQ Appointment",
          description: "Appointment Payment",
          order_id: "${orderData.id}",
          receipt: "${orderData.receipt}",
          handler: function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'payment_success',
              data: response
            }));
          },
          prefill: {
            contact: "",
            email: ""
          },
          notes: {
            appointmentId: "${appointmentId}"
          },
          theme: {
            color: "#3b82f6"
          },
          retry: {
            enabled: true,
            max_count: 3
          },
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true
          },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_cancelled'
              }));
            }
          }
        };

        const rzp = new Razorpay(options);
        
        rzp.on('payment.failed', function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'payment_failed',
            error: response.error.description || 'Payment failed'
          }));
        });

        // Auto-open Razorpay checkout
        rzp.open();
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          error: error.message || 'Failed to initialize payment'
        }));
      }
    })();
  </script>
</body>
</html>
    `;
  };

  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'payment_success') {
        // Step 3: Verify payment (same as frontend handler)
        try {
          setLoading(true);
          
          const { data } = await axios.post(
            `${API_BASE}/api/user/verifyRazorpay`,
            message.data,
            { headers: { token } }
          );

          if (data.success) {
            // Emit telemetry
            console.log('payment_success', {
              appointmentId: appointment._id,
              paymentId: message.data.razorpay_payment_id,
            });

            Alert.alert('Success', 'Payment completed successfully!', [
              {
                text: 'OK',
                onPress: () => {
                  onSuccess && onSuccess();
                  onClose();
                },
              },
            ]);
          } else {
            throw new Error(data.message || 'Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          Alert.alert(
            'Verification Error',
            error.response?.data?.message || error.message || 'Payment verification failed'
          );
        } finally {
          setLoading(false);
        }
      } else if (message.type === 'payment_failed') {
        console.error('Payment failed:', message.error);
        console.log('payment_failed', {
          appointmentId: appointment._id,
          error: message.error,
        });
        
        // Provide helpful error message with test card info if in test mode
        const isTestMode = RAZORPAY_KEY_ID && RAZORPAY_KEY_ID.includes('test');
        let errorMessage = message.error || 'Payment could not be processed';
        let showTestCardInfo = false;
        
        // Check if error suggests using test cards
        if (isTestMode) {
          if (
            errorMessage.includes('another method') ||
            errorMessage.includes('temporary technical issue') ||
            errorMessage.includes('International cards') ||
            errorMessage.includes('not supported')
          ) {
            showTestCardInfo = true;
          }
        }
        
        if (showTestCardInfo) {
          errorMessage = `Payment failed: ${errorMessage}\n\n💡 Test Mode - Use These Options:\n\n📱 UPI (Recommended):\n• Use any UPI ID (e.g., test@paytm)\n• Or use test UPI: success@razorpay\n\n💳 Domestic Test Card:\n• Card: 5267 3181 8797 5449\n• Expiry: 12/25 (any future date)\n• CVV: 123 (any 3 digits)\n• Name: Any name\n\nAlternative Test Cards:\n• 4111 1111 1111 1111\n• 5104 0600 0000 0008\n\nNote: Only Indian test cards/UPI work in test mode.`;
        }
        
        Alert.alert('Payment Failed', errorMessage, [
          {
            text: 'Try Again',
            onPress: () => {
              // Retry payment
              initializePayment();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: onClose,
          },
        ]);
      } else if (message.type === 'payment_cancelled') {
        console.log('Payment cancelled by user');
        Alert.alert('Payment Cancelled', 'Payment was cancelled. You can try again anytime.', [
          {
            text: 'OK',
            onPress: onClose,
          },
        ]);
      } else if (message.type === 'error') {
        console.error('Payment error:', message.error);
        Alert.alert('Error', message.error || 'An error occurred. Please try again.');
        onClose();
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (!WebView) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              WebView is required for payment.{'\n\n'}
              Please use a development build or contact support.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onClose}>
              <Text style={styles.retryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Processing payment...</Text>
          </View>
        )}

        {checkoutHTML ? (
          <WebView
            ref={webViewRef}
            source={{ html: checkoutHTML }}
            onMessage={handleWebViewMessage}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading payment gateway...</Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              Alert.alert('Error', 'Failed to load payment page. Please try again.');
              onClose();
            }}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Initializing payment...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default RazorpayPaymentModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
