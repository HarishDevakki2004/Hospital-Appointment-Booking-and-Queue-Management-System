import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import { FiArrowLeft, FiMapPin, FiClock, FiNavigation } from "react-icons/fi";
import { getTravelTime, getUserLocation } from "../utils/getTravelTime";

const DoctorProfile = () => {
  const { docId } = useParams();
  const { doctors, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [doctorLocation, setDoctorLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [travelData, setTravelData] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isCalculatingTravel, setIsCalculatingTravel] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (doctors.length > 0) {
      const doc = doctors.find((d) => d._id === docId);
      if (doc) {
        setDocInfo(doc);
        // Set doctor location if available
        if (doc.location && doc.location.latitude && doc.location.longitude) {
          setDoctorLocation({
            lat: doc.location.latitude,
            lng: doc.location.longitude
          });
        }
      }
    }
  }, [doctors, docId]);

  // Initialize Google Map
  useEffect(() => {
    if (doctorLocation && window.google && window.google.maps) {
      const mapElement = document.getElementById('doctor-map');
      if (mapElement && !map) {
        const newMap = new window.google.maps.Map(mapElement, {
          center: doctorLocation,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        const newMarker = new window.google.maps.Marker({
          position: doctorLocation,
          map: newMap,
          title: docInfo?.name || 'Doctor Location',
          animation: window.google.maps.Animation.DROP,
        });

        setMap(newMap);
        setMarker(newMarker);
      }
    }
  }, [doctorLocation, docInfo]);

  // Request user location
  const requestUserLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      
      // Add user marker to map
      if (map && window.google) {
        const userMarker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: 'Your Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4f46e5',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          animation: window.google.maps.Animation.DROP,
        });

        // Fit bounds to show both markers
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(doctorLocation);
        bounds.extend(location);
        map.fitBounds(bounds);

        // Draw route line
        if (window.google.maps.DirectionsService && window.google.maps.DirectionsRenderer) {
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
          });

          directionsService.route(
            {
              origin: location,
              destination: doctorLocation,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === 'OK') {
                directionsRenderer.setDirections(result);
              }
            }
          );
        }
      }

      // Calculate travel time
      await calculateTravelTime(location);
    } catch (error) {
      setLocationError(error.message);
      toast.error(`Location error: ${error.message}`);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Calculate travel time
  const calculateTravelTime = async (userLoc = userLocation) => {
    if (!userLoc || !doctorLocation) return;

    setIsCalculatingTravel(true);
    try {
      const result = await getTravelTime(userLoc, doctorLocation);
      setTravelData(result);
      toast.success(`Travel time calculated: ${result.duration} minutes`);
    } catch (error) {
      toast.error(`Failed to calculate travel time: ${error.message}`);
    } finally {
      setIsCalculatingTravel(false);
    }
  };

  // Open in Google Maps
  const openInGoogleMaps = () => {
    if (doctorLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${doctorLocation.lat},${doctorLocation.lng}`;
      window.open(url, '_blank');
    }
  };

  if (!docInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 pb-20 md:pb-8"
    >
      {/* Back button */}
      <motion.button
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-6"
      >
        <FiArrowLeft className="text-lg" />
        <span>Back</span>
      </motion.button>

      {/* Doctor Info Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={docInfo.image}
            alt={docInfo.name}
            className="w-32 h-32 rounded-xl object-cover border-4 border-primary/20"
          />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
              {docInfo.name}
              <img src={assets.verified_icon} alt="Verified" className="w-5 h-5" />
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {docInfo.degree} - {docInfo.speciality}
            </p>
            {docInfo.location?.address && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <FiMapPin className="text-primary" />
                <span>{docInfo.location.address}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Map Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiMapPin className="text-primary" />
            Doctor Location
          </h2>
        </div>
        
        {doctorLocation ? (
          <>
            <div id="doctor-map" className="w-full h-96"></div>
            
            <div className="p-6 space-y-4">
              {/* Location Permission Button */}
              {!userLocation && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={requestUserLocation}
                  disabled={isLoadingLocation}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Getting your location...
                    </>
                  ) : (
                    <>
                      <FiNavigation />
                      Get My Location & Calculate Travel Time
                    </>
                  )}
                </motion.button>
              )}

              {/* Travel Time Display */}
              {travelData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-primary/10 to-cyan-50 dark:from-primary/20 dark:to-cyan-900/20 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FiClock className="text-primary" />
                      <span className="font-medium">Estimated Travel Time:</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {travelData.duration} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Distance:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {travelData.distance} km
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Open in Google Maps Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openInGoogleMaps}
                className="w-full px-6 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <FiMapPin />
                Open in Google Maps
              </motion.button>

              {/* Error Message */}
              {locationError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
                  {locationError}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <FiMapPin className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Doctor location not available. Please contact the clinic for directions.
            </p>
          </div>
        )}
      </motion.div>

      {/* Book Appointment Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/appointment/${docId}`)}
          className="px-8 py-3 bg-primary text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
        >
          Book Appointment
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default DoctorProfile;


