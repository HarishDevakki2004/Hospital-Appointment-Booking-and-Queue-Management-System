# 🚑 MediQ

## 📝 Project Overview

**MediQ** is a modern, user-friendly platform that simplifies the process of booking and managing doctor appointments. It bridges the gap between patients and healthcare providers with a smooth interface for scheduling, real-time updates, and secure payments. Designed for accessibility and efficiency, MediQ improves patient experience and streamlines doctor appointment management.

## 🎯 Main Goal

The primary goal of **MediQ** is to create a streamlined, secure, and efficient healthcare ecosystem. It enables patients to connect with doctors effortlessly while giving healthcare providers a robust platform to manage their schedules. MediQ focuses on reducing waiting times, enhancing patient satisfaction, and ensuring smooth operations in the medical field.

## ✨ Key Features

- 🧭 **User-Friendly Interface** – Easy navigation for booking, rescheduling, and canceling appointments
- 🔍 **Specialization Filters** – Find doctors based on area of expertise
- 🕒 **Real-Time Availability** – Instantly confirm available appointment slots
- 💳 **Secure Online Payments** – Integrated with Razorpay for secure transactions
- 🔐 **Data Security** – Bcrypt used for password encryption
- 🔔 **Notifications & Reminders** – Email/SMS alerts for appointment status and reminders
- ☁️ **Scalable & Cloud-Enabled** – Cloudinary for media uploads and storage

## 🌐 Live Demo

Try out the live demo of MediQ:

| Role       | Live Demo Link                                 | Credentials                                        |
|------------|------------------------------------------------|---------------------------------------------------|
| **Patient**| [Patient Portal](https://docplus-user.vercel.app/)   | 📧 `patient@docplus.com` <br> 🔑 `patient123`     |
| **Doctor** | [Doctor Dashboard](https://docplus-admin.vercel.app/) | 📧 `vijay@gmail.com` <br> 🔑 `123456789`       |
| **Admin**  | [Admin Panel](https://docplus-admin.vercel.app/) | 📧 `admin@gmail.com` <br> 🔑 `docplus123`      |

> ⚠️ **Note**: This is a demo environment. Please avoid entering real personal information.

## 🛠 Technology Stack

| Layer        | Technology             |
|--------------|------------------------|
| **Frontend** | React.js               |
| **Backend**  | Node.js (JavaScript)   |
| **Database** | MongoDB                |
| **Cloud**    | Cloudinary             |
| **Auth**     | Bcrypt                 |
| **Payments** | Razorpay               |

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js (v14 or above)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- Razorpay account (for payment gateway)

### ⚙️ Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Docplus.git
cd Docplus
3. Install the dependencies:

 ```bash
   npm install
   ```
4. Set up environment variables:

Create a `.env.local` file in the root directory and add the following configuration:

```bash
MONGODB_URI ='MongoDB URI here'
CLOUDINARY_NAME = 'Cloudinary Name here'
CLOUDINARY_API_KEY ='Cloudinary API key here'
CLOUDINARY_SECRET_KEY =' Cloudinary Secret key here'
ADMIN_EMAIL = 'admin@gmail.com'
ADMIN_PASSWORD = 'docplus123'
JWT_SECRET = "doctalk"
RAZORPAY_KEY_ID = 'Razorpay Key Id here'
RAZORPAY_KEY_SECRET = 'Razorpay Key Secret here'
CURRENCY = "INR"
VITE_BACKEND_URL=http://localhost:4000
```

5. Run the application:
   npm run dev

## Features and Usage

### 1. **Patient Portal**

   - Register, filter for doctors, view profiles, and book appointments.
   
### 2. **Doctor Dashboard**

   - Manage availability, view appointments, and interact with patients.
   
### 3 **Admin Panel**

   - Monitor system activity, manage user accounts, and handle payments.

## How It Works

1. **User Registration**: Patients and doctors register with secure authentication via Bcrypt.

2. **Filtered & Book**: Patients Book the doctors using filters and book available slots.

3. **Payment Processing**: Payments are handled securely using Razorpay.

4. **Cloud Media Management**: User profile images and documents are uploaded and stored in Cloudinary.

5. **Data Storage**: All reviews and university data are securely stored in MongoDB.

## Security Measures
- **Encryption**: User passwords are encrypted using Bcrypt for robust security.
- **Data Privacy**: User data and interactions are encrypted and protected.
- **Secure Payments**: Razorpay ensures compliance with industry-standard payment protocols.
- **Cloud Security**: Cloudinary handles media storage with secure access and delivery.
