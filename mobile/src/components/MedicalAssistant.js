import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { API_BASE } from '../config';

const MedicalAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigation = useNavigation();
  const { doctors } = useContext(AppContext);

  // Doctor specialization mapping
  const specialityMapping = {
    'General Physician': ['General physician', 'General Practitioner', 'GP'],
    'Cardiologist': ['Cardiologist', 'Cardiology'],
    'Dermatologist': ['Dermatologist'],
    'Neurologist': ['Neurologist'],
    'ENT Specialist': ['ENT', 'Ear Nose Throat', 'Otolaryngologist', 'ENT Specialist'],
    'Orthopedic Doctor': ['Orthopedic', 'Orthopedist', 'Orthopedic Doctor'],
    'Pediatrician': ['Pediatrician', 'Pediatricians', 'Pediatrics'],
    'Gynecologist': ['Gynecologist', 'Gynaecologist', 'OB-GYN'],
    'Dentist': ['Dentist', 'Dental'],
  };

  // Symptom to doctor mapping
  const symptomToDoctor = {
    // General Physician
    fever: 'General Physician',
    cold: 'General Physician',
    cough: 'General Physician',
    flu: 'General Physician',
    headache: 'General Physician',
    bodyache: 'General Physician',
    fatigue: 'General Physician',
    nausea: 'General Physician',
    
    // Cardiologist
    'chest pain': 'Cardiologist',
    'chest discomfort': 'Cardiologist',
    breathlessness: 'Cardiologist',
    'shortness of breath': 'Cardiologist',
    'heart palpitations': 'Cardiologist',
    'irregular heartbeat': 'Cardiologist',
    'high blood pressure': 'Cardiologist',
    
    // Dermatologist
    'skin rash': 'Dermatologist',
    rash: 'Dermatologist',
    itching: 'Dermatologist',
    'skin irritation': 'Dermatologist',
    acne: 'Dermatologist',
    'skin infection': 'Dermatologist',
    eczema: 'Dermatologist',
    psoriasis: 'Dermatologist',
    
    // Neurologist
    dizziness: 'Neurologist',
    numbness: 'Neurologist',
    'tingling sensation': 'Neurologist',
    'severe headache': 'Neurologist',
    migraine: 'Neurologist',
    seizures: 'Neurologist',
    'memory problems': 'Neurologist',
    'vision problems': 'Neurologist',
    
    // ENT Specialist
    'ear pain': 'ENT Specialist',
    'throat pain': 'ENT Specialist',
    'sore throat': 'ENT Specialist',
    sinus: 'ENT Specialist',
    sinusitis: 'ENT Specialist',
    'ear infection': 'ENT Specialist',
    'hearing loss': 'ENT Specialist',
    'nasal congestion': 'ENT Specialist',
    
    // Orthopedic Doctor
    'joint pain': 'Orthopedic Doctor',
    'bone pain': 'Orthopedic Doctor',
    fracture: 'Orthopedic Doctor',
    'back pain': 'Orthopedic Doctor',
    'neck pain': 'Orthopedic Doctor',
    'muscle pain': 'Orthopedic Doctor',
    arthritis: 'Orthopedic Doctor',
    
    // Pediatrician
    'child fever': 'Pediatrician',
    'child vomiting': 'Pediatrician',
    'child illness': 'Pediatrician',
    'infant health': 'Pediatrician',
    'baby health': 'Pediatrician',
    
    // Gynecologist
    "women's health": 'Gynecologist',
    'menstrual problems': 'Gynecologist',
    pregnancy: 'Gynecologist',
    gynecological: 'Gynecologist',
    'pelvic pain': 'Gynecologist',
    
    // Dentist
    'tooth pain': 'Dentist',
    toothache: 'Dentist',
    'bleeding gums': 'Dentist',
    'dental pain': 'Dentist',
    'gum problems': 'Dentist',
    'oral health': 'Dentist',
  };

  // First aid guidance
  const firstAidGuidance = {
    fever: 'Drink plenty of water, rest, and use a cold compress on your forehead. Monitor your temperature regularly.',
    vomiting: 'Take small sips of water or ORS solution. Avoid solid foods for a few hours. Rest and stay hydrated.',
    'chest pain': 'Sit upright, stay calm, and avoid exertion. If pain persists or worsens, seek immediate medical care.',
    headache: 'Rest in a dark, quiet room. Drink water and apply a cold compress. Avoid screens and bright lights.',
    rash: 'Apply a cool compress to the affected area. Avoid scratching. Keep the area clean and dry.',
    burns: 'Run cool (not cold) water over the burn for 10-15 minutes. Cover with a clean, dry cloth. Avoid ice or butter.',
    dizziness: 'Sit or lie down immediately. Drink water. Avoid sudden movements. If it persists, seek medical attention.',
    'ear pain': 'Apply a warm compress to the affected ear. Avoid inserting anything into the ear. Rest and stay hydrated.',
    'throat pain': 'Gargle with warm salt water. Drink warm liquids like tea or soup. Rest your voice.',
    'joint pain': 'Rest the affected joint. Apply ice for 15-20 minutes. Elevate if possible. Avoid strenuous activity.',
    'tooth pain': 'Rinse with warm salt water. Apply a cold compress to the outside of your cheek. Avoid very hot or cold foods.',
    'child fever': 'Keep the child hydrated with water or ORS. Dress them in light clothing. Use a lukewarm sponge bath. Monitor temperature.',
    'child vomiting': 'Give small sips of water or ORS solution. Avoid solid foods. Keep the child in an upright position. Monitor for dehydration signs.',
  };

  // Serious symptoms
  const seriousSymptoms = [
    'severe chest pain',
    'difficulty breathing',
    'unconsciousness',
    'severe bleeding',
    'severe burns',
    'severe allergic reaction',
    'stroke symptoms',
    'heart attack',
    'severe head injury',
    'severe abdominal pain',
    'severe dehydration',
    'seizures',
    'severe trauma',
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const greetingText = "Hello! I'm your medical assistant. Please tell me your symptoms, and I'll help you with first-aid guidance and suggest the right doctor.";
        console.log('Adding initial greeting:', greetingText);
        addBotMessage(greetingText, null, false, []);
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const addBotMessage = (text, suggestedDoctor = null, showBooking = false, recommendedDoctors = []) => {
    // Ensure text is not null/undefined
    const messageText = text && text.trim() ? text.trim() : 'No response received. Please try again.';
    
    console.log('Adding bot message:', {
      text: messageText.substring(0, 50) + '...',
      suggestedDoctor,
      showBooking,
      recommendedDoctorsCount: recommendedDoctors?.length || 0
    });
    
    setMessages((prev) => [
      ...prev,
      {
        type: 'bot',
        text: messageText,
        suggestedDoctor,
        showBooking,
        recommendedDoctors: recommendedDoctors || [],
        timestamp: new Date(),
      },
    ]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { type: 'user', text, timestamp: new Date() },
    ]);
  };

  // Analyze symptoms using Gemini AI via backend
  const analyzeSymptoms = async (symptoms) => {
    try {
      const url = `${API_BASE}/api/medical-assistant/analyze-symptoms`;
      console.log('Calling medical assistant API:', url);
      
      const response = await axios.post(
        url,
        { symptoms },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('Medical assistant API response status:', response.status);
      console.log('Medical assistant API response data:', response.data);

      if (response.data && response.data.success) {
        const data = response.data.data;
        console.log('API response data:', JSON.stringify(data, null, 2));
        
        // Only return doctor if it's not a greeting and speciality is actually provided
        const hasDoctor = !data.isGreeting && data.suggestedSpeciality && data.suggestedSpeciality !== null;
        
        // Build message from available fields
        let message = '';
        if (data.firstAidGuidance) {
          message = data.firstAidGuidance;
        } else if (data.generalAdvice) {
          message = data.generalAdvice;
        } else if (data.explanation) {
          message = data.explanation;
        } else {
          message = 'Please consult a doctor for proper diagnosis and treatment.';
        }
        
        // Add explanation if available and not already in message
        if (data.explanation && !message.includes(data.explanation)) {
          message += `\n\n${data.explanation}`;
        }
        
        // Add first aid steps if available
        if (data.firstAidSteps && Array.isArray(data.firstAidSteps) && data.firstAidSteps.length > 0) {
          message += '\n\n**First Aid Steps:**\n';
          data.firstAidSteps.forEach((step, index) => {
            message += `${index + 1}. ${step}\n`;
          });
        }
        
        return {
          isGreeting: data.isGreeting || false,
          isSerious: data.isSerious || false,
          message: message.trim() || 'Please consult a doctor for proper diagnosis and treatment.',
          doctor: hasDoctor ? data.suggestedSpeciality : null,
          recommendedDoctors: hasDoctor ? (data.recommendedDoctors || []) : [],
          explanation: data.explanation || null,
        };
      } else {
        // Fallback to local analysis if API fails
        console.warn('API returned success=false, using fallback');
        return analyzeSymptomsLocal(symptoms);
      }
    } catch (error) {
      console.error('Error calling medical assistant API:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      // Fallback to local analysis if API fails
      return analyzeSymptomsLocal(symptoms);
    }
  };

  // Local fallback analysis (original logic)
  const analyzeSymptomsLocal = (symptoms) => {
    const lowerSymptoms = symptoms.toLowerCase().trim();
    
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy'];
    const isGreeting = greetings.some(
      (greeting) =>
        lowerSymptoms === greeting ||
        lowerSymptoms.startsWith(greeting + ' ') ||
        lowerSymptoms.endsWith(' ' + greeting)
    );
    
    if (isGreeting || lowerSymptoms.length < 5) {
      return {
        isGreeting: true,
        message: "Hello! I'm here to help you with medical guidance. Please describe your symptoms, and I'll provide first-aid advice and suggest the right doctor for you.",
        doctor: null,
        recommendedDoctors: [],
      };
    }
    
    const isSerious = seriousSymptoms.some((serious) => lowerSymptoms.includes(serious));

    if (isSerious) {
      return {
        isSerious: true,
        message: '⚠️ These symptoms may indicate a serious condition. Please seek immediate medical care or call emergency services right away. Do not delay.',
        doctor: null,
        recommendedDoctors: [],
      };
    }

    let suggestedDoctor = null;
    for (const [symptom, doctor] of Object.entries(symptomToDoctor)) {
      if (lowerSymptoms.includes(symptom)) {
        if (!suggestedDoctor) {
          suggestedDoctor = doctor;
        }
      }
    }

    if (!suggestedDoctor) {
      suggestedDoctor = 'General Physician';
    }

    let firstAid = null;
    for (const [condition, guidance] of Object.entries(firstAidGuidance)) {
      if (lowerSymptoms.includes(condition)) {
        if (!firstAid) {
          firstAid = guidance;
        }
      }
    }

    if (!firstAid) {
      firstAid = 'Rest, stay hydrated, and monitor your symptoms. If symptoms persist or worsen, consult a doctor.';
    }

    // Find matching doctors from context
    const recommendedDoctors = doctors.filter(
      (doc) => doc.speciality.toLowerCase() === suggestedDoctor.toLowerCase() ||
               suggestedDoctor.toLowerCase().includes(doc.speciality.toLowerCase())
    ).slice(0, 3);

    return {
      isSerious: false,
      message: firstAid,
      doctor: suggestedDoctor,
      recommendedDoctors: recommendedDoctors,
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue('');
    setIsTyping(true);

    try {
      const analysis = await analyzeSymptoms(userMessage);
      
      // Handle greetings and conversational messages
      if (analysis.isGreeting) {
        const greetingMessage = analysis.message || "Hello! I'm here to help you with medical guidance. Please describe your symptoms, and I'll provide first-aid advice and suggest the right doctor for you.";
        addBotMessage(greetingMessage, null, false, []);
      } else if (analysis.isSerious) {
        // Serious condition - no doctor booking
        const seriousMessage = analysis.message || '⚠️ These symptoms may indicate a serious condition. Please seek immediate medical care or call emergency services right away. Do not delay.';
        addBotMessage(seriousMessage, null, false, []);
      } else if (analysis.doctor && analysis.doctor !== null) {
        // Has doctor recommendation - show booking option
        let message = analysis.message || 'Please consult a doctor for proper diagnosis and treatment.';
        
        // Format message nicely
        if (analysis.explanation && !message.includes(analysis.explanation)) {
          message = `**First Aid Guidance:**\n${message}\n\n**Why ${analysis.doctor}?**\n${analysis.explanation}`;
        } else {
          message = `**First Aid Guidance:**\n${message}\n\n**Suggested Doctor:** ${analysis.doctor}`;
        }
        
        // Show booking option even if no recommended doctors (user can search)
        addBotMessage(
          message,
          analysis.doctor,
          true,
          analysis.recommendedDoctors || []
        );
      } else {
        // General response without doctor recommendation
        const generalMessage = analysis.message || 'Please consult a doctor for proper diagnosis and treatment. If symptoms are severe, seek immediate medical attention.';
        addBotMessage(generalMessage, null, false, []);
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Try fallback to local analysis
      try {
        const fallbackAnalysis = analyzeSymptomsLocal(userMessage);
        if (fallbackAnalysis.isGreeting) {
          addBotMessage(fallbackAnalysis.message, null, false, []);
        } else if (fallbackAnalysis.isSerious) {
          addBotMessage(fallbackAnalysis.message, null, false, []);
        } else {
          const fallbackMessage = `**First Aid Guidance:**\n${fallbackAnalysis.message}\n\n**Suggested Doctor:** ${fallbackAnalysis.doctor || 'General Physician'}`;
          addBotMessage(
            fallbackMessage,
            fallbackAnalysis.doctor,
            true,
            fallbackAnalysis.recommendedDoctors || []
          );
        }
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
        addBotMessage(
          'I apologize, but I encountered an error. Please try again or describe your symptoms in more detail.',
          null,
          false
        );
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleBooking = (doctorSpeciality, recommendedDoctors = []) => {
    // If we have specific recommended doctors, navigate to the first one
    if (recommendedDoctors && recommendedDoctors.length > 0) {
      navigation.navigate('DoctorProfile', { doctorId: recommendedDoctors[0]._id });
      addBotMessage(
        `I've opened the profile for ${recommendedDoctors[0].name}. You can book an appointment directly.`,
        null,
        false
      );
      setIsOpen(false);
      return;
    }

    // Otherwise, navigate to doctors list with speciality filter
    const specialityKey = Object.keys(specialityMapping).find(
      (key) => key === doctorSpeciality
    );

    if (specialityKey) {
      const actualSpeciality = specialityMapping[specialityKey][0];
      navigation.navigate('Doctors', { speciality: actualSpeciality });
      addBotMessage(
        `I've opened the doctors page for you. You can now book an appointment with a ${doctorSpeciality}.`,
        null,
        false
      );
    } else {
      navigation.navigate('Doctors');
      addBotMessage(
        "I've opened the doctors page. Please use the filters to find a suitable doctor.",
        null,
        false
      );
    }
    
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Button */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={styles.chatButtonIcon}>{isOpen ? '✕' : '💬'}</Text>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.chatWindow}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <Text style={styles.headerIconText}>❤️</Text>
                </View>
                <View>
                  <Text style={styles.headerTitle}>Medical Assistant</Text>
                  <Text style={styles.headerSubtitle}>I'm here to help</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={messagesEndRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg, idx) => {
                // Ensure message text is always a valid string
                let messageText = 'No response received. Please try again.';
                if (msg.text) {
                  if (typeof msg.text === 'string') {
                    messageText = msg.text.trim() || 'No response received. Please try again.';
                  } else {
                    messageText = String(msg.text).trim() || 'No response received. Please try again.';
                  }
                }
                
                const isUser = msg.type === 'user';
                
                return (
                  <View key={idx} style={styles.messageRow}>
                    {!isUser && (
                      <View style={styles.botAvatarContainer}>
                        <View style={styles.botAvatar}>
                          <Text style={styles.botAvatarText}>🤖</Text>
                        </View>
                      </View>
                    )}
                    
                    <View style={[
                      styles.messageContainer,
                      isUser ? styles.messageContainerUser : styles.messageContainerBot
                    ]}>
                      <View style={[
                        styles.messageBubble,
                        isUser ? styles.messageBubbleUser : styles.messageBubbleBot
                      ]}>
                        <View style={styles.messageTextWrapper}>
                          {(() => {
                            // Simple text rendering - handle markdown bold
                            const parts = messageText.split('**');
                            if (parts.length === 1) {
                              // No markdown, just return text
                              return (
                                <Text
                                  style={[
                                    styles.messageText,
                                    isUser && styles.messageTextUser,
                                  ]}
                                >
                                  {messageText}
                                </Text>
                              );
                            }
                            // Has markdown, render with bold
                            return (
                              <Text
                                style={[
                                  styles.messageText,
                                  isUser && styles.messageTextUser,
                                ]}
                              >
                                {parts.map((part, i) => {
                                  if (i % 2 === 1) {
                                    // Bold text
                                    return (
                                      <Text 
                                        key={i} 
                                        style={[
                                          styles.boldText,
                                          isUser && styles.boldTextUser
                                        ]}
                                      >
                                        {part}
                                      </Text>
                                    );
                                  }
                                  // Regular text
                                  return part;
                                })}
                              </Text>
                            );
                          })()}
                        </View>
                      </View>
                      
                      {msg.showBooking && msg.suggestedDoctor && (
                        <View style={styles.bookingActionsContainer}>
                          <TouchableOpacity
                            style={styles.bookingButton}
                            onPress={() => handleBooking(msg.suggestedDoctor, msg.recommendedDoctors)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.bookingButtonText}>
                              📅 Book with {msg.suggestedDoctor}
                            </Text>
                          </TouchableOpacity>
                          {msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                            <View style={styles.recommendedDoctors}>
                              <Text style={styles.recommendedDoctorsTitle}>Recommended Doctors:</Text>
                              {msg.recommendedDoctors.slice(0, 3).map((doctor, docIdx) => (
                                <TouchableOpacity
                                  key={doctor._id || docIdx}
                                  style={styles.doctorCard}
                                  onPress={() => {
                                    setIsOpen(false);
                                    navigation.navigate('DoctorProfile', { doctorId: doctor._id });
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.doctorName}>{doctor.name || 'Unknown Doctor'}</Text>
                                  <Text style={styles.doctorSpeciality}>{doctor.speciality || 'General'}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                    
                    {isUser && (
                      <View style={styles.userAvatarContainer}>
                        <View style={styles.userAvatar}>
                          <Text style={styles.userAvatarText}>👤</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}

              {isTyping && (
                <View style={styles.messageRow}>
                  <View style={styles.botAvatarContainer}>
                    <View style={styles.botAvatar}>
                      <Text style={styles.botAvatarText}>🤖</Text>
                    </View>
                  </View>
                  <View style={[styles.messageContainer, styles.messageContainerBot]}>
                    <View style={[styles.messageBubble, styles.messageBubbleBot]}>
                      <View style={styles.typingIndicator}>
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Describe your symptoms..."
                placeholderTextColor="#9ca3af"
                multiline
                editable={!isTyping}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!inputValue.trim() || isTyping}
                style={[
                  styles.sendButton,
                  (!inputValue.trim() || isTyping) && styles.sendButtonDisabled,
                ]}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.disclaimer}>
              This is not a substitute for professional medical advice
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    bottom: 90, // Position above the tab bar (tab bar is ~70px, so 90px gives space)
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  chatButtonIcon: {
    fontSize: 24,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatWindow: {
    height: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  headerIconText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  botAvatarContainer: {
    width: 36,
    height: 36,
    marginRight: 8,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  botAvatarText: {
    fontSize: 18,
  },
  userAvatarContainer: {
    width: 36,
    height: 36,
    marginLeft: 8,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  userAvatarText: {
    fontSize: 18,
  },
  messageContainer: {
    flex: 1,
    maxWidth: '75%',
  },
  messageContainerUser: {
    alignItems: 'flex-end',
  },
  messageContainerBot: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
  },
  messageBubbleUser: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  messageBubbleBot: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  messageTextWrapper: {
    flexShrink: 1,
  },
  messageText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  boldText: {
    fontWeight: '700',
    color: '#1f2937',
  },
  boldTextUser: {
    color: '#ffffff',
    fontWeight: '700',
  },
  bookingActionsContainer: {
    marginTop: 10,
    width: '100%',
  },
  bookingButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  recommendedDoctors: {
    marginTop: 12,
  },
  recommendedDoctorsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSpeciality: {
    fontSize: 12,
    color: '#6b7280',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#93c5fd',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: '#f9fafb',
  },
});

export default MedicalAssistant;

