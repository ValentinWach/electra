# Frontend Application

This is the electra frontend application built with React, TypeScript, and Vite.
It is build for ***Chromium Browsers*** like Google Chrome, so prefaribly use it there. Downloading the correct fonts from CDN requires an active internet connection, else a fallback font will be used.
This sections quickly introduces the the frontend page structure, and below, there is a quickstart guide.

The appllication is split into three subapplications:
- **Ergebnisse**: Analyse Election results, all paths start with `/ergebnisse`. Details: see below.
- **Voting**: Page for citizens to hand in votes, all paths start with `/stimmabgabe`. Tokens created on Admin can be used for login.
- **Admin**: Admin page, currently the only path is `/admin/start`. Create tokens, init recalculation of results and batch upload votes for testing.

### Ergebnisse
- **Uebersicht**: Seat distribution and nationwide results.
- **Wahlkreise**: A Wahlkreisliste, and a map which shows the winning parties per wahlkreis. A wahlkreis can be selected in the list or on the map to see detailed results.
- **Parteien**: A list of all bundestagsparties and another one of all parties. By klicking on a party you see their closest winners/loosers, and below there is a table showing all Überhangsmandate if any exist.
- **Analysen**: 3 Additional analyses.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Chart.js, D3.js
- **Maps:** Leaflet with React-Leaflet 4
- **Routing:** React Router DOM
- **API Integration:** OpenAPI Generator

## Project Structure

```
frontend/              # Root of the projec:, config files, ...
├── src/
│   ├── api/           # Generated API clients
│   ├── apps/          # Out Components for the three subapplications
│   ├── components/    # Reusable components (core of the application)
│   ├── constants/     # Application constants 
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── models/        # TypeScript interfaces/types for component props
│   ├── pages/         # Page & Subpage components for each subapplication
│   └── utils/         # Utility functions
├── public/            # Public static files
└── dist/              # Build output
```

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

After navigating to the frontend directory, run the following commands to install dependencies & start the application:

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

When starting backend & frontend in localhost, keep the default port settings in the frontend (5173) & backend (8000) so CORS and all settings work.

Start the incremental development server:
```bash
npm run dev
```

### Building for Production & Testing

Build and start the application:
```bash
npm run prod
```

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run prod` - Build and start production server
- `npm run generate-api` - Generate API clients from OpenAPI specification