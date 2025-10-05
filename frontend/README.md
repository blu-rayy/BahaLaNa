# BahaLaNa Frontend 🌊

AI-powered flood risk assessment application using NASA satellite data and machine learning.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router** - Routing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running at `http://localhost:8000`
- NASA Earthdata token (optional)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_EARTHDATA_TOKEN=your_token_here
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   App available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Features

- 🗺️ Interactive map with location picker
- 📅 Date range selection for analysis
- 🌊 ML-powered flood risk assessment
- 📊 Color-coded risk visualization
- 🔔 Toast notifications
- 🎨 Responsive design

## Project Structure

```
src/
├── components/    # UI components
├── services/      # API clients
├── stores/        # State management
├── utils/         # Helper functions
└── pages/         # Page components
```

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Leaflet Documentation](https://leafletjs.com)
- [Tailwind CSS](https://tailwindcss.com)
