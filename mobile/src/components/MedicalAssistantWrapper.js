import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import MedicalAssistant from './MedicalAssistant';

const MedicalAssistantWrapper = () => {
  const { token } = useContext(AppContext);
  
  // Only show AI assistant for logged-in patients
  if (!token) {
    return null;
  }
  
  return <MedicalAssistant />;
};

export default MedicalAssistantWrapper;

