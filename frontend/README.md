# Frontend Application

This is the electra frontend application built with React, TypeScript, and Vite.
It is build for Chromium Browsers, so prefaribly use it there. Downloading the correct fonts from CDN requires internet connection, else a fallback font will be used.
This sections quickly introduces the the frontend page structure, and below, there is a quickstart guide.

The appllication is split into three subapplications:
- **Ergebnisse**: Analyse Election results, all paths start with `/ergebnisse`
- **Voting**: Page for citizens to hand in votes, all paths start with `/stimmabgabe`. Tokens created on Admin can be used for login. Should be self explainatory.
- **Admin**: Admin page, currently only path is `/admin/start`. Create tokens, init recalculation of results and batch upload votes for testing. Should be self explainatory.

###Ergebnisse
Ergebnisse are split in "Uebersicht" for seat distribution and nationwide results.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Chart.js, D3.js
- **Maps:** Leaflet with React-Leaflet
- **Routing:** React Router DOM
- **API Integration:** OpenAPI Generator (TypeScript-fetch)

## Project Structure

```
frontend/
├── src/
│   ├── api/           # Generated API clients
│   ├── apiMocks/      # API mock data
│   ├── apps/          # Application-specific code
│   ├── assets/        # Static assets
│   ├── components/    # Reusable components
│   ├── constants/     # Application constants
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── models/        # TypeScript interfaces/types
│   ├── pages/         # Page components
│   ├── utils/         # Utility functions
│   └── __test__/      # Test files
├── public/            # Public static files
└── dist/             # Build output
```

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Generate API clients:
```bash
npm run generate-api
```

### Development

Start the development server:
```bash
npm run dev
```

### Building for Production

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
- `npm run lint` - Run ESLint
- `npm run prod` - Build and start production server
- `npm run generate-api` - Generate API clients from OpenAPI specification

## Features

- Modern React with TypeScript support
- Component-based architecture
- Chart visualization using Chart.js and D3.js
- Interactive maps with Leaflet
- Responsive design with Tailwind CSS
- OpenAPI integration for type-safe API calls
- ESLint configuration for code quality
- Jest setup for testing

## Contributing

1. Follow the existing code structure
2. Maintain type safety with TypeScript
3. Write tests for new features
4. Update documentation as needed
5. Follow the ESLint configuration

## Testing

Tests are located in the `src/__test__` directory. Run tests using:
```bash
npm test
```
