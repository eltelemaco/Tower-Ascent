# Tower Rescue

## Overview

Tower Rescue is a casual idle-clicker mobile game built with Expo and React Native. Players save a character trapped on a tower by progressively destroying blocks through tapping. The game features character-driven emotional engagement where the character reacts to player progress with cheers, encouragement, and animations.

The project follows a monorepo structure with a React Native mobile client (Expo) and an Express.js backend server, sharing code through a common `shared/` directory.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: React Navigation with native stack navigators (stack-only architecture for single-screen game with modal overlays)
- **State Management**: React Context (GameContext) for game state, React Query for server state
- **Styling**: StyleSheet with custom theme constants, react-native-reanimated for animations
- **Fonts**: Nunito (Google Fonts) - chosen for rounded, friendly, highly legible appearance

### Key Screens
1. MainMenuScreen - Game entry point with Play, Settings, Stats
2. GameScreen - Core gameplay with tower, character, and tap interaction
3. Modal overlays - Pause, Victory, Settings, Stats, Bonus modals

### Game Logic
- 9 tower blocks with escalating click requirements (1, 22, 333, 4444... to 999999999)
- Character states: idle, cheer, worry with corresponding animations
- Bonus system with power-ups (hammer, lightning, double-tap, speed boost)
- Persistent stats stored in AsyncStorage

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, compiled with TSX for development
- **API Structure**: Routes registered in `server/routes.ts`, prefixed with `/api`
- **Storage**: In-memory storage (MemStorage class) with interface for future database integration

### Path Aliases
- `@/` maps to `./client/`
- `@shared/` maps to `./shared/`

### Design System
- Primary color: #FF6B35 (Vibrant Orange)
- Background: #FFF4E6 (Warm Cream)
- Tower blocks use gradient colors per level
- Spacing, BorderRadius, and Typography constants defined in `client/constants/theme.ts`

## External Dependencies

### Mobile/Client
- **expo-haptics**: Haptic feedback for tap interactions
- **expo-audio**: Sound effects (infrastructure present, implementation pending)
- **@react-native-async-storage/async-storage**: Local persistence for game stats and settings
- **react-native-reanimated**: Complex animations for character, blocks, and UI elements
- **expo-splash-screen**: App launch experience

### Backend
- **drizzle-orm + drizzle-zod**: Database ORM with Zod schema validation (PostgreSQL configured but using in-memory storage currently)
- **pg**: PostgreSQL client (prepared for future database integration)

### Shared
- **zod**: Schema validation for shared types between client and server