import React, { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FiMessageCircle, FiX, FiSend, FiAlertCircle, FiHeart, FiUser } from "react-icons/fi";

const MedicalAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  // Doctor specialization mapping - maps suggested doctor to actual system speciality names
  const specialityMapping = {
    "General Physician": ["General physician", "General Practitioner", "GP"],
    "Cardiologist": ["Cardiologist", "Cardiology"],
    "Dermatologist": ["Dermatologist"],
    "Neurologist": ["Neurologist"],
    "ENT Specialist": ["ENT", "Ear Nose Throat", "Otolaryngologist", "ENT Specialist"],
    "Orthopedic Doctor": ["Orthopedic", "Orthopedist", "Orthopedic Doctor"],
    "Pediatrician": ["Pediatrician", "Pediatricians", "Pediatrics"],
    "Gynecologist": ["Gynecologist", "Gynaecologist", "OB-GYN"],
    "Dentist": ["Dentist", "Dental"]
  };

  // Symptom to doctor mapping
  const symptomToDoctor = {
    // General Physician
    fever: "General Physician",
    cold: "General Physician",
    cough: "General Physician",
    flu: "General Physician",
    headache: "General Physician",
    bodyache: "General Physician",
    fatigue: "General Physician",
    nausea: "General Physician",
    
    // Cardiologist
    "chest pain": "Cardiologist",
    "chest discomfort": "Cardiologist",
    breathlessness: "Cardiologist",
    "shortness of breath": "Cardiologist",
    "heart palpitations": "Cardiologist",
    "irregular heartbeat": "Cardiologist",
    "high blood pressure": "Cardiologist",
    
    // Dermatologist
    "skin rash": "Dermatologist",
    rash: "Dermatologist",
    itching: "Dermatologist",
    "skin irritation": "Dermatologist",
    acne: "Dermatologist",
    "skin infection": "Dermatologist",
    eczema: "Dermatologist",
    psoriasis: "Dermatologist",
    
    // Neurologist
    dizziness: "Neurologist",
    numbness: "Neurologist",
    "tingling sensation": "Neurologist",
    "severe headache": "Neurologist",
    migraine: "Neurologist",
    seizures: "Neurologist",
    "memory problems": "Neurologist",
    "vision problems": "Neurologist",
    
    // ENT Specialist
    "ear pain": "ENT Specialist",
    "throat pain": "ENT Specialist",
    "sore throat": "ENT Specialist",
    sinus: "ENT Specialist",
    "sinusitis": "ENT Specialist",
    "ear infection": "ENT Specialist",
    "hearing loss": "ENT Specialist",
    "nasal congestion": "ENT Specialist",
    
    // Orthopedic Doctor
    "joint pain": "Orthopedic Doctor",
    "bone pain": "Orthopedic Doctor",
    fracture: "Orthopedic Doctor",
    "back pain": "Orthopedic Doctor",
    "neck pain": "Orthopedic Doctor",
    "muscle pain": "Orthopedic Doctor",
    arthritis: "Orthopedic Doctor",
    
    // Pediatrician
    "child fever": "Pediatrician",
    "child vomiting": "Pediatrician",
    "child illness": "Pediatrician",
    "infant health": "Pediatrician",
    "baby health": "Pediatrician",
    
    // Gynecologist
    "women's health": "Gynecologist",
    "menstrual problems": "Gynecologist",
    "pregnancy": "Gynecologist",
    "gynecological": "Gynecologist",
    "pelvic pain": "Gynecologist",
    
    // Dentist
    "tooth pain": "Dentist",
    "toothache": "Dentist",
    "bleeding gums": "Dentist",
    "dental pain": "Dentist",
    "gum problems": "Dentist",
    "oral health": "Dentist"
  };

  // First aid guidance
  const firstAidGuidance = {
    fever: "Drink plenty of water, rest, and use a cold compress on your forehead. Monitor your temperature regularly.",
    vomiting: "Take small sips of water or ORS solution. Avoid solid foods for a few hours. Rest and stay hydrated.",
    "chest pain": "Sit upright, stay calm, and avoid exertion. If pain persists or worsens, seek immediate medical care.",
    headache: "Rest in a dark, quiet room. Drink water and apply a cold compress. Avoid screens and bright lights.",
    rash: "Apply a cool compress to the affected area. Avoid scratching. Keep the area clean and dry.",
    burns: "Run cool (not cold) water over the burn for 10-15 minutes. Cover with a clean, dry cloth. Avoid ice or butter.",
    dizziness: "Sit or lie down immediately. Drink water. Avoid sudden movements. If it persists, seek medical attention.",
    "ear pain": "Apply a warm compress to the affected ear. Avoid inserting anything into the ear. Rest and stay hydrated.",
    "throat pain": "Gargle with warm salt water. Drink warm liquids like tea or soup. Rest your voice.",
    "joint pain": "Rest the affected joint. Apply ice for 15-20 minutes. Elevate if possible. Avoid strenuous activity.",
    "tooth pain": "Rinse with warm salt water. Apply a cold compress to the outside of your cheek. Avoid very hot or cold foods.",
    "child fever": "Keep the child hydrated with water or ORS. Dress them in light clothing. Use a lukewarm sponge bath. Monitor temperature.",
    "child vomiting": "Give small sips of water or ORS solution. Avoid solid foods. Keep the child in an upright position. Monitor for dehydration signs."
  };

  // Serious symptoms that require immediate care
  const seriousSymptoms = [
    "severe chest pain",
    "difficulty breathing",
    "unconsciousness",
    "severe bleeding",
    "severe burns",
    "severe allergic reaction",
    "stroke symptoms",
    "heart attack",
    "severe head injury",
    "severe abdominal pain",
    "severe dehydration",
    "seizures",
    "severe trauma"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setTimeout(() => {
        addBotMessage("Hello! I'm your medical assistant. Please tell me your symptoms, and I'll help you with first-aid guidance and suggest the right doctor.");
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (text, suggestedDoctor = null, showBooking = false) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text,
        suggestedDoctor,
        showBooking,
        timestamp: new Date(),
      },
    ]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text, timestamp: new Date() },
    ]);
  };

  const analyzeSymptoms = (symptoms) => {
    const lowerSymptoms = symptoms.toLowerCase().trim();
    
    // Check if it's a greeting or non-medical message
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "greetings", "howdy"];
    const isGreeting = greetings.some(greeting => 
      lowerSymptoms === greeting || lowerSymptoms.startsWith(greeting + " ") || lowerSymptoms.endsWith(" " + greeting)
    );
    
    if (isGreeting || lowerSymptoms.length < 5) {
      return {
        isGreeting: true,
        message: "Hello! I'm here to help you with medical guidance. Please describe your symptoms, and I'll provide first-aid advice and suggest the right doctor for you.",
        doctor: null,
      };
    }
    
    // Check for serious symptoms first
    const isSerious = seriousSymptoms.some((serious) =>
      lowerSymptoms.includes(serious)
    );

    if (isSerious) {
      return {
        isSerious: true,
        message: "⚠️ These symptoms may indicate a serious condition. Please seek immediate medical care or call emergency services right away. Do not delay.",
        doctor: null,
      };
    }

    // Find matching doctor specialization - check all symptoms
    let suggestedDoctor = null;
    let matchedSymptoms = [];
    
    for (const [symptom, doctor] of Object.entries(symptomToDoctor)) {
      if (lowerSymptoms.includes(symptom)) {
        if (!suggestedDoctor) {
          suggestedDoctor = doctor;
        }
        matchedSymptoms.push(symptom);
      }
    }

    // If no specific match, default to General Physician
    if (!suggestedDoctor) {
      suggestedDoctor = "General Physician";
    }

    // Find first aid guidance - check all conditions
    let firstAid = null;
    let matchedConditions = [];
    
    for (const [condition, guidance] of Object.entries(firstAidGuidance)) {
      if (lowerSymptoms.includes(condition)) {
        if (!firstAid) {
          firstAid = guidance;
        }
        matchedConditions.push(condition);
      }
    }

    // Generic first aid if no specific match
    if (!firstAid) {
      firstAid = "Rest, stay hydrated, and monitor your symptoms. If symptoms persist or worsen, consult a doctor.";
    }

    return {
      isSerious: false,
      message: firstAid,
      doctor: suggestedDoctor,
    };
  };

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const analysis = analyzeSymptoms(userMessage);
      
      if (analysis.isGreeting) {
        addBotMessage(analysis.message, null, false);
      } else if (analysis.isSerious) {
        addBotMessage(analysis.message, null, false);
      } else {
        addBotMessage(
          `**First Aid Guidance:**\n${analysis.message}\n\n**Suggested Doctor:** ${analysis.doctor}`,
          analysis.doctor,
          true
        );
      }
      
      setIsTyping(false);
    }, 1500);
  };

  const handleBooking = (doctorSpeciality) => {
    // Find the matching speciality in the doctors list
    // doctorSpeciality is like "General Physician", we need to find the key that matches
    const specialityKey = Object.keys(specialityMapping).find((key) => 
      key === doctorSpeciality
    );

    if (specialityKey) {
      // Find actual speciality name used in the system (first alias)
      const actualSpeciality = specialityMapping[specialityKey][0];
      
      // Navigate to doctors page - the filter will be applied via URL or state
      navigate("/doctors", { 
        state: { filterSpeciality: actualSpeciality } 
      });
      
      addBotMessage(
        `I've opened the doctors page for you. You can now book an appointment with a ${doctorSpeciality}.`,
        null,
        false
      );
    } else {
      // Fallback: navigate to doctors page
      navigate("/doctors");
      addBotMessage(
        "I've opened the doctors page. Please use the filters to find a suitable doctor.",
        null,
        false
      );
    }
    
    setIsOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <FiHeart size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Medical Assistant</h3>
                  <p className="text-xs text-white/80">I'm here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.type === "user"
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {msg.type === "bot" && (
                      <div className="flex items-start gap-2 mb-1">
                        <FiUser className="mt-1 flex-shrink-0" size={16} />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">
                      {msg.text.split("**").map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i}>{part}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </div>
                    {msg.showBooking && msg.suggestedDoctor && (
                      <motion.button
                        onClick={() => handleBooking(msg.suggestedDoctor)}
                        className="mt-3 w-full bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Book Appointment with {msg.suggestedDoctor}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your symptoms..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isTyping}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSend size={20} />
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                This is not a substitute for professional medical advice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MedicalAssistant;

