

https://github.com/user-attachments/assets/203f632a-e6d3-4806-a18b-ae23e40fb02a


# MusicSense

MusicSense is a modern music application that helps you organize and discover music based on your memories and moods. Built with React Native and Expo, it offers a seamless experience for managing your music collection and getting AI-powered music suggestions.

## Why MusicSense?

In today's world of endless music streaming, we often lose the personal connection to our music. MusicSense brings back that connection by:

- **Memory-Based Organization**: Instead of just playlists, organize your music around meaningful moments and memories
- **AI-Powered Discovery**: Get personalized music suggestions based on your current mood, not just algorithms
- **Local Music Integration**: Keep your local music collection organized alongside streaming content
- **Smart Tagging**: Add custom tags to tracks for better organization and searchability
- **Modern Experience**: Enjoy a beautiful, intuitive interface with smooth animations and background playback
- **Privacy-Focused**: Your music data stays on your device, with AI suggestions processed securely

## Features

- **Memory Collections**: Create and organize your music into themed collections
- **AI-Powered Suggestions**: Get personalized music recommendations based on your mood
- **Local Music Integration**: Access and manage your local music library
- **Smart Tagging**: Add tags to tracks for better organization and searchability
- **Modern UI**: Beautiful, intuitive interface with smooth animations
- **Background Playback**: Listen to music while using other apps
- **Mini Player**: Quick access to playback controls from anywhere in the app

## Tech Stack

### Frontend

- React Native with Expo
- TypeScript
- Clerk for authentication
- React Query for data fetching
- React Native Audio Pro for audio playback
- OpenAI for AI-powered music suggestions
- TailwindCSS for styling

### Backend

- Bun runtime for high-performance JavaScript execution
- Hono web framework for fast, lightweight API routing
- TypeScript for type safety
- Drizzle ORM for type-safe database operations
- OpenAI API integration
- Clerk authentication
- Static file serving for audio files

## Prerequisites

### Frontend

- Node.js 18 or higher
- Expo CLI
- Android Studio (for Android development)
- OpenAI API key
- Clerk account and API keys

### Backend

- Bun runtime
- OpenAI API key
- Clerk account and API keys

## Installation

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:

```
WEBHOOK_SECRET=your_clerk_webhook_secret
TURSO_DATABASE_URL=turso_database_url
TURSO_DATABASE_URL=turso_database_token
OPENAI_API_KEY=your_openai_api_key
SPOTIFY_URL=base_url_for_spotify_api
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. Run database migrations:

```bash
bun run drizzle-kit push
```

5. Start the backend server:

```bash
bun run dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd musicsense
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:
   Create a `.env` file in the frontend directory with the following variables:

```
EXPO_PUBLIC_API_URL=backend_url
EXPO_PUBLIC_CLIENT_ID=spotify_client_id
EXPO_PUBLIC_CLIENT_SECRET=spotify_client_secret
OPENAI_API_KEY=your_openai_api_key
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_SPOTIFY_URL=https://api.spotify.com/v1
```

4. Start the development server:

```bash
bun run dev
```

5. Run on your preferred platform:

```bash
# For Android
bun expo run:android
```

## Usage

1. **Creating Memories**: Tap the "+" button to create a new memory collection
2. **Adding Music**:
   - Upload local music files
   - Add tracks from AI suggestions
   - Tag tracks for better organization
3. **Getting Suggestions**:
   - Tap the Reddit icon
   - Enter your mood
   - Get AI-powered music recommendations
4. **Playing Music**:
   - Tap any track to start playback
   - Use the mini player for quick controls
   - Long press tracks to add them to memories
