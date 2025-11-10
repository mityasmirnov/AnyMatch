# 🎬 AnyMatch - Swipe & Match Movies Together

<div align="center">

![AnyMatch Logo](client/public/logo.svg)

**Find movies to watch with friends, Tinder-style!**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://reactjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE)](https://trpc.io/)

[Live Demo](https://anymatch.manus.space) · [User Guide](./USER_GUIDE.md) · [Report Bug](https://github.com/mityasmirnov/AnyMatch/issues) · [Request Feature](https://github.com/mityasmirnov/AnyMatch/issues)

</div>

---

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**AnyMatch** is a modern web application that solves the age-old problem: *"What should we watch tonight?"*

Instead of endless scrolling through streaming platforms and group chats full of indecision, AnyMatch brings the simplicity of Tinder-style swiping to movie selection. Create a group with friends or family, swipe through movies and TV shows, and when everyone likes the same title, it's a match!

### The Problem

- **Decision Fatigue**: Too many options on streaming platforms
- **Group Indecision**: Hard to agree on what to watch
- **Time Wasted**: Spending more time choosing than watching

### The Solution

- **Simple Swiping**: Swipe right to like, left to pass
- **Group Consensus**: Automatically find movies everyone wants to watch
- **AI Recommendations**: Personalized suggestions based on your taste
- **Streaming Integration**: See where each movie is available

---

## ✨ Features

### Core Features

- **🎴 Tinder-Style Swiping**
  - Swipe right to like, left to dislike
  - Swipe up for super like (notifies group members)
  - Swipe down to save for later
  - Undo last swipe with one click
  - Keyboard shortcuts for power users

- **👥 Group Matching**
  - Create unlimited groups
  - Join groups with 6-character codes
  - Real-time match notifications
  - View all group matches in one place
  - Track watched movies

- **🤖 AI Recommendations**
  - Personalized suggestions using OpenAI
  - Collaborative filtering based on group behavior
  - Content-based filtering by genres, actors, directors
  - Continuous learning from swipe patterns

- **📺 Streaming Availability**
  - See where movies are available (Netflix, Disney+, Hulu, etc.)
  - Region-specific streaming data
  - Direct links to streaming platforms

- **🔖 Saved Movies**
  - Save movies to decide later
  - Filter by content type (movies/TV)
  - Swipe on saved items anytime
  - Remove from saved list

- **⚙️ User Preferences**
  - Select favorite genres
  - Choose content type (movies, TV, or both)
  - Set minimum rating threshold
  - Customize discovery feed

### UI/UX Features

- **💎 Liquid Glass Design**
  - Beautiful glassmorphism effects
  - Animated gradient backgrounds
  - Smooth transitions and micro-interactions
  - Dark theme optimized for movie browsing

- **📱 Fully Responsive**
  - Desktop navigation bar
  - Mobile bottom navigation
  - Tablet-optimized layouts
  - Touch gestures for mobile swiping

- **♿ Accessible**
  - Keyboard navigation
  - ARIA labels
  - Focus indicators
  - Screen reader support

---

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **shadcn/ui** - Beautiful component library
- **Wouter** - Lightweight routing
- **tRPC React** - Type-safe API client

### Backend

- **Node.js 22** - JavaScript runtime
- **Express 4** - Web framework
- **tRPC 11** - End-to-end type-safe APIs
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Relational database
- **Manus OAuth** - Secure authentication

### External APIs

- **TMDB API** - Movie and TV show data
- **OMDB API** - Additional movie metadata
- **OpenAI API** - AI-powered recommendations

### DevOps

- **Vite** - Fast build tool
- **TSX** - TypeScript execution
- **Drizzle Kit** - Database migrations
- **GitHub Actions** - CI/CD (coming soon)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22 or higher
- **pnpm** package manager
- **MySQL** or **TiDB** database
- **TMDB API Key** ([Get one here](https://www.themoviedb.org/settings/api))
- **OMDB API Key** ([Get one here](http://www.omdbapi.com/apikey.aspx))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/mityasmirnov/AnyMatch.git
cd AnyMatch
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=your-name

# TMDB API
TMDB_API_KEY=your-tmdb-api-key
TMDB_ACCESS_TOKEN=your-tmdb-access-token

# OMDB API
OMDB_API_KEY=your-omdb-api-key

# Manus Platform
VITE_APP_ID=your-app-id
VITE_APP_TITLE=AnyMatch
VITE_APP_LOGO=/logo.svg
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
```

4. **Set up the database**

```bash
# Generate and run migrations
pnpm db:push
```

5. **Start the development server**

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

---

## 📁 Project Structure

```
anymatch/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── Navigation.tsx
│   │   │   ├── SwipeCard.tsx
│   │   │   └── MovieDetailsModal.tsx
│   │   ├── pages/        # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Swipe.tsx
│   │   │   ├── Groups.tsx
│   │   │   ├── Matches.tsx
│   │   │   ├── Saved.tsx
│   │   │   └── Profile.tsx
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities and tRPC client
│   │   ├── App.tsx       # Main app component
│   │   └── index.css     # Global styles
│   └── index.html        # HTML entry point
├── server/                # Backend Express application
│   ├── _core/            # Core framework files
│   ├── db.ts             # Database query helpers
│   ├── queries.ts        # Business logic queries
│   ├── routers.ts        # Main tRPC router
│   ├── anymatch-routers.ts  # Feature routers
│   ├── tmdb.ts           # TMDB API service
│   └── ai-recommendations.ts # AI recommendation engine
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Database tables
├── shared/               # Shared types and constants
├── storage/              # S3 storage helpers
├── USER_GUIDE.md         # User documentation
├── test-report.md        # Testing documentation
└── README.md             # This file
```

---

## 📚 API Documentation

### tRPC Routers

AnyMatch uses tRPC for type-safe API communication. All endpoints are automatically typed on both client and server.

#### Authentication Router (`auth`)

- `auth.me` - Get current user
- `auth.logout` - Logout user

#### Movies Router (`movies`)

- `movies.discover` - Get movie recommendations
  - Input: `{ type: 'movie' | 'tv' | 'both', page: number }`
  - Output: Array of movies/TV shows

- `movies.search` - Search for movies
  - Input: `{ query: string, type: 'movie' | 'tv' | 'both' }`
  - Output: Array of search results

- `movies.getGenres` - Get all available genres
  - Output: Array of genres

- `movies.getDetails` - Get detailed movie information
  - Input: `{ movieId: string, type: 'movie' | 'tv' }`
  - Output: Movie details with cast, trailer, streaming providers

#### Groups Router (`groups`)

- `groups.create` - Create a new group
  - Input: `{ name: string }`
  - Output: Group with join code

- `groups.join` - Join a group with code
  - Input: `{ joinCode: string }`
  - Output: Success status

- `groups.list` - Get user's groups
  - Output: Array of groups

- `groups.get` - Get group details
  - Input: `{ groupId: number }`
  - Output: Group with members

- `groups.getMatches` - Get group matches
  - Input: `{ groupId: number }`
  - Output: Array of matched movies

#### Swipes Router (`swipes`)

- `swipes.swipe` - Record a swipe
  - Input: `{ movieId, direction, movieTitle, moviePoster, movieType, movieGenres, movieRating }`
  - Output: `{ success: boolean, matched?: boolean }`

- `swipes.undo` - Undo last swipe
  - Output: `{ success: boolean }`

#### Saved Router (`saved`)

- `saved.list` - Get saved movies
  - Output: Array of saved movies

- `saved.remove` - Remove from saved
  - Input: `{ movieId: string }`
  - Output: `{ success: boolean }`

#### AI Router (`ai`)

- `ai.getRecommendations` - Get AI-powered recommendations
  - Input: `{ count?: number }`
  - Output: Array of recommended movies with explanations

### Database Schema

#### Tables

- **users** - User accounts
- **user_preferences** - User preferences (genres, content type, min rating)
- **groups** - Movie groups
- **group_members** - Group membership
- **swipes** - Swipe history
- **matches** - Group matches
- **saved_movies** - Saved for later
- **notifications** - User notifications

See `drizzle/schema.ts` for full schema definitions.

---

## 🚢 Deployment

### Deploying to Manus Platform

AnyMatch is designed to run on the Manus platform with zero configuration:

1. **Push to GitHub**

```bash
git push origin main
```

2. **Connect to Manus**
   - Log in to Manus dashboard
   - Connect your GitHub repository
   - Manus will automatically detect and deploy

3. **Set Environment Variables**
   - Add your API keys in the Manus dashboard
   - Database is automatically provisioned

4. **Deploy**
   - Click "Publish" in the Manus UI
   - Your app will be live at `https://your-app.manus.space`

### Deploying to Other Platforms

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

```bash
docker build -t anymatch .
docker run -p 3000:3000 anymatch
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write TypeScript with strict types
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

### Code Style

- Use **Prettier** for formatting
- Use **ESLint** for linting
- Follow **React best practices**
- Write **semantic HTML**
- Use **Tailwind utilities** over custom CSS

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **The Movie Database (TMDB)** for providing comprehensive movie data
- **OpenAI** for powering AI recommendations
- **Manus Platform** for hosting and authentication
- **shadcn/ui** for beautiful UI components
- **All contributors** who help make AnyMatch better

---

## 📧 Contact

**Project Maintainer**: Dmitry Smirnov

**GitHub**: [@mityasmirnov](https://github.com/mityasmirnov)

**Project Link**: [https://github.com/mityasmirnov/AnyMatch](https://github.com/mityasmirnov/AnyMatch)

---

<div align="center">

**Made with ❤️ by Manus AI**

[⬆ Back to Top](#-anymatch---swipe--match-movies-together)

</div>
