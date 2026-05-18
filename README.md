# Milvexa 🐄🐄🐄

A professional, mobile-ready Dairy Farm Management application with a premium Green theme. Built as a Progressive Web App (PWA) for native-like performance on Android.

## ✨ Features

- **Dashboard**: Real-time stats on milk production, revenue, and herd health.
- **Animal Management**: Detailed profiles for Cows and Buffaloes with search and filters.
- **Milk Entry**: Streamlined daily milk quantity recording for morning and evening sessions.
- **Finance Hub**: Interactive charts and automated profit/loss tracking.
- **Modern UI**: Emerald Green theme with glassmorphism, responsive for all devices.

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your system.

### Installation
1. Clone the repository and navigate to the folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack
- **Frontend**: React.js + Vite
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Styling**: Vanilla CSS (Custom properties & Glassmorphism)

## 📡 Database Integration (Supabase)
To connect your own database:
1. Create a project at [supabase.com](https://supabase.com).
2. Use the provided SQL schema (in implementation plan) to create tables.
3. Update `src/services/supabaseClient.js` with your Project URL and API Key.

---
Designed for simplicity and efficiency. 🥛
