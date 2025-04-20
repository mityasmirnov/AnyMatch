# DinoMatch App Architecture

## Overview
DinoMatch is a mobile-first web application that combines collaborative group management with Tinder-style swipe mechanics for movie selection. The app allows users to swipe through movies/TV series to define both individual and mutual viewing preferences.

## Technology Stack
- **Frontend**: React.js with Next.js framework
- **UI Library**: Tailwind CSS with shadcn/ui components
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Movie Data**: External free movie API (to be determined)
- **Deployment**: Firebase Hosting (with instructions for alternatives)

## Core Components

### Authentication System
- Email/Password authentication
- Google authentication
- Apple authentication
- User profile management
- Session management

### Group Management
- Create named spaces (couples, families, teams)
- Generate unique join codes
- Join existing groups via codes
- Group settings and preferences
- Majority voting system for larger groups

### Movie Swipe Interface
- Tinder-style card interface
- Movie details display (cover, title, genre, description, ratings)
- Swipe actions (like/dislike)
- History tracking
- Preference recording

### Genre Survey
- Initial preference collection
- Genre selection interface
- Mood input options
- Preference storage

### Matching Algorithm
- Prioritize unwatched movies
- Consider individual preferences
- Match based on group consensus
- Support for different group sizes

### Filtering System
- Filter by ratings
- Filter by genre
- Filter by type (movie/TV series)
- Filter by platform availability

## Database Schema

### Users Collection
```
users/
  {userId}/
    email: string
    displayName: string
    photoURL: string
    preferences: {
      favoriteGenres: array<string>
      dislikedGenres: array<string>
    }
    createdAt: timestamp
    lastActive: timestamp
```

### Groups Collection
```
groups/
  {groupId}/
    name: string
    joinCode: string
    createdBy: string (userId)
    createdAt: timestamp
    members: array<{
      userId: string
      role: string (owner/member)
      joinedAt: timestamp
    }>
    settings: {
      matchThreshold: number (percentage for larger groups)
      activeFilters: {
        minRating: number
        genres: array<string>
        type: string (movie/tv/both)
      }
    }
```

### Swipes Collection
```
swipes/
  {userId}/
    movies/
      {movieId}/
        movieId: string
        title: string
        coverUrl: string
        genre: string
        description: string
        rating: number
        direction: string (left/right)
        timestamp: timestamp
```

### Matches Collection
```
matches/
  {groupId}/
    {matchId}/
      movieId: string
      title: string
      coverUrl: string
      genre: string
      description: string
      rating: number
      matchedAt: timestamp
      matchedBy: array<string> (userIds)
      watched: boolean
      watchedAt: timestamp
```

## API Integration

### Movie Data API
- Search functionality
- Movie details retrieval
- Genre listings
- Rating information
- Platform availability (where to watch)

### Firebase API
- Authentication services
- Firestore database operations
- Cloud Functions for complex operations
- Storage for assets

## File Structure
```
dinomatch/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── assets/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── groups/
│   │   ├── movies/
│   │   ├── swipe/
│   │   ├── survey/
│   │   ├── ui/
│   │   └── layout/
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   ├── GroupContext.js
│   │   └── MovieContext.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useGroup.js
│   │   ├── useMovies.js
│   │   └── useToast.js
│   ├── pages/
│   │   ├── index.js
│   │   ├── auth/
│   │   ├── groups/
│   │   ├── movies/
│   │   └── profile/
│   ├── services/
│   │   ├── firebase.js
│   │   ├── movieApi.js
│   │   ├── authService.js
│   │   └── groupService.js
│   ├── styles/
│   │   └── globals.css
│   └── utils/
│       ├── helpers.js
│       ├── constants.js
│       └── validators.js
├── firebase.json
├── firestore.rules
├── package.json
└── README.md
```

## Responsive Design
- Mobile-first approach
- Flexible layouts using Flexbox and Grid
- Responsive components with Tailwind CSS
- Touch-friendly interactions
- Adaptive UI for different screen sizes

## Security Considerations
- Authentication state management
- Firestore security rules
- Data validation
- Protected routes
- API key security

## Performance Optimization
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Efficient database queries

## Scalability
- Modular code structure
- Component reusability
- Expandable database schema
- Support for growing from couples to larger groups
