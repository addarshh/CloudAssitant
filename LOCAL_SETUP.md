# CloudForge - Local Setup Guide

## Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

## Installation Steps

1. **Clone/Download the project files**
   ```bash
   # Copy all project files to your local directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser and go to: `http://localhost:5000`
   - The application will be running with hot-reload enabled

## Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   └── lib/           # Utilities and types
├── server/                # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # In-memory data storage
├── shared/                # Shared types and schemas
└── package.json           # Dependencies and scripts
```

## How It Works
- **Frontend**: React with Vite for fast development
- **Backend**: Express.js server with TypeScript
- **Storage**: In-memory storage (no database required)
- **File Uploads**: Stored locally in `uploads/` directory
- **Templates**: Generated server-side with realistic cloud configurations

## No External Services Required
- All template generation happens locally
- No actual cloud provider APIs are called
- File uploads are stored on your local filesystem
- Everything runs offline after initial setup