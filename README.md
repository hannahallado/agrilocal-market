# AgriLocal Mobile Market

<div align="center">

**Connecting Local Farmers with Conscious Consumers**

A React Native mobile marketplace application that bridges the gap between local agricultural vendors and buyers, promoting sustainable local food systems.

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Team](#-team)

</div>

---

## About

AgriLocal Mobile Market is a comprehensive mobile application built with React Native and Expo that enables:

- **Buyers** to discover, browse, and purchase fresh produce from local farms
- **Vendors** to manage their inventory, track orders, and connect with customers
- **Communities** to support local agriculture and sustainable food systems

### Key Highlights

- **Interactive Map** - Discover nearby farms and vendors
- **Smart Cart** - Persistent shopping cart with multi-vendor support
- **Favorites** - Save your favorite vendors and products
- **Secure Authentication** - Powered by Supabase with persistent sessions
- **Dual User Roles** - Separate experiences for buyers and vendors
- **Offline Support** - AsyncStorage for persistent data

---

## Features

### For Buyers

- **Browse & Search**
  - Interactive map view with vendor locations
  - Search products by name, category, or vendor
  - Filter and sort options
  - Product detail views with images and descriptions

- **Shopping Experience**
  - Add products to cart from multiple vendors
  - Persistent cart across sessions
  - Real-time cart updates
  - Multiple payment methods support

- **Favorites & Personalization**
  - Save favorite vendors and products
  - Quick access to favorites
  - Personalized recommendations

- **Order Management**
  - Order confirmation screens
  - Order history tracking
  - Real-time order status updates

### For Vendors

- **Dashboard**
  - Sales overview and analytics
  - Order notifications
  - Quick stats and insights

- **Inventory Management**
  - Add, edit, and delete products
  - Upload product images
  - Manage stock levels
  - Set pricing and units

- **Order Processing**
  - View incoming orders
  - Update order status
  - Order detail views
  - Customer information

- **Profile Management**
  - Vendor profile customization
  - Farm information and images
  - Business hours and location

---

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for physical device testing)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd agrilocal_project_endterm
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase**

   Update `lib/supabase.js` with your Supabase credentials:

   ```javascript
   const supabaseUrl = "YOUR_SUPABASE_URL";
   const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";
   ```

4. **Start the development server**

   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

---

## Usage

### First Time Setup

1. **Launch the app** - You'll see the splash screen
2. **Select your role** - Choose between Buyer or Vendor
3. **Sign up or Login**
   - Create a new account with email and password
   - Or continue as a guest (limited features)
4. **Start exploring!**

### For Buyers

1. **Discover Vendors**
   - Use the Map tab to find nearby farms
   - Browse vendors by location
   - View vendor profiles and ratings

2. **Shop Products**
   - Search for specific products
   - Add items to your cart
   - Manage quantities

3. **Checkout**
   - Review your cart
   - Select payment method
   - Confirm your order

### For Vendors

1. **Set Up Your Profile**
   - Add farm name and description
   - Upload farm images
   - Set your location

2. **Manage Inventory**
   - Add new products
   - Upload product images
   - Set prices and stock levels

3. **Process Orders**
   - View incoming orders
   - Update order status
   - Track sales

---

## Architecture

### Tech Stack

- **Frontend Framework**: React Native 0.81.5
- **Development Platform**: Expo ~54.0.33
- **Navigation**: React Navigation 7.x
- **Backend**: Supabase (Authentication & Database)
- **State Management**: React Context API
- **Local Storage**: AsyncStorage
- **Maps**: React Native Maps
- **UI Components**: React Native Paper, Vector Icons

### State Management

The app uses **React Context API** for global state management:

- **AuthContext**: Manages authentication state, user data, and session persistence
- **FavoritesContext**: Manages favorite vendors and products

### Data Persistence

- **AsyncStorage**: Used for offline data persistence
  - User sessions (auto-login)
  - Shopping cart
  - Favorites (vendors & products)
  - User preferences

---

## Team

**Developed by:**

- **Hannah Grace S. Allado**
- **Alyhanna Azel Pineda**
- **Babylin B. Sebongga**

<div align="center">

**Made with ❤️ for Local Agriculture**

</div>
