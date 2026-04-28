import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import MedicalAssistant from './components/MedicalAssistant'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import About from './pages/About'
import Appointment from './pages/Appointment'
import Contact from './pages/Contact'
import Doctors from './pages/Doctors'
import Home from './pages/Home'
import Login from './pages/Login'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import DoctorProfile from './pages/DoctorProfile'
import BookingSlot from './pages/BookingSlot'
import { ToastContainer } from 'react-toastify'
import { AppContext } from './context/AppContext'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const { token, isLoading } = useContext(AppContext)

  // Show loading spinner while checking token
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Show Navbar only on desktop and when logged in */}
      {token && <div className="hidden md:block"><Navbar /></div>}
      
      <main className='w-full max-w-full overflow-x-hidden'>
        <Routes>
          {!token ? (
            // Not logged in - show login page for all routes
            <>
              <Route path='/login' element={<Login />} />
              <Route path='/' element={<Navigate to="/login" replace />} />
              <Route path='*' element={<Navigate to="/login" replace />} />
            </>
          ) : (
            // Logged in - show app pages
            <>
              <Route path='/' element={<Home />} />
              <Route path='/doctors' element={<Doctors />} />
              <Route path='/doctors/:speciality' element={<Doctors />} />
              <Route path='/about' element={<About />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/doctor/:docId' element={<DoctorProfile />} />
              <Route path='/appointment/:docId' element={<Appointment />} />
              <Route path='/booking-slot/:doctorId' element={<BookingSlot />} />
              <Route path='/my-appointments' element={<MyAppointments />} />
              <Route path='/my-profile' element={<MyProfile />} />
              <Route path='/login' element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>
      
      {/* Show Footer only on desktop */}
      <div className="hidden md:block"><Footer /></div>
      
      {/* Show Bottom Nav only on mobile and when logged in */}
      {token && <BottomNav />}
      
      <MedicalAssistant />
    </div>
  )
}

export default App
