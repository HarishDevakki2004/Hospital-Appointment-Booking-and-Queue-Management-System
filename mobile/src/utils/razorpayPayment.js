/**
 * Razorpay Payment Integration for React Native
 * Uses WebView for Razorpay checkout in Expo
 */

import axios from 'axios';
import { API_BASE } from '../config';

/**
 * Initialize Razorpay payment
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} Payment result
 */
export const initRazorpayPayment = async ({
  appointmentId,
  amount,
  token,
  onSuccess,
  onFailure,
}) => {
  try {
    // Create payment intent on server
    const { data } = await axios.post(
      `${API_BASE}/api/user/payment-razorpay`,
      { appointmentId },
      { headers: { token } }
    );

    if (!data.success || !data.order) {
      throw new Error(data.message || 'Failed to create payment order');
    }

    const order = data.order;

    // Get Razorpay key from environment or config
    // For React Native, we'll use a WebView-based checkout
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
};

/**
 * Verify payment with server
 */
export const verifyPayment = async (paymentResponse, appointmentId, token) => {
  try {
    const { data } = await axios.post(
      `${API_BASE}/api/user/verifyRazorpay`,
      {
        ...paymentResponse,
        appointmentId,
      },
      { headers: { token } }
    );

    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Generate Razorpay checkout HTML
 */
export const generateRazorpayCheckoutHTML = (orderId, amount, currency, keyId, onSuccess, onFailure) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body>
      <div id="razorpay-container" style="display: flex; justify-content: center; align-items: center; height: 100vh;">
        <div>Loading payment...</div>
      </div>
      <script>
        var options = {
          key: "${keyId}",
          amount: ${amount},
          currency: "${currency}",
          name: "MediQ Appointment",
          description: "Appointment Payment",
          order_id: "${orderId}",
          handler: function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'success',
              data: response
            }));
          },
          prefill: {
            contact: "",
            email: ""
          },
          theme: {
            color: "#3b82f6"
          },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'failure',
                error: 'Payment cancelled'
              }));
            }
          }
        };
        
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'failure',
            error: response.error.description || 'Payment failed'
          }));
        });
        
        rzp.open();
      </script>
    </body>
    </html>
  `;
};

