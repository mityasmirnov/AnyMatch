# DinoMatch - Find Movies You'll Both Love

DinoMatch is a mobile-first web application that combines collaborative group management with Tinder-style swipe mechanics for movie selection. Initially targeted at couples—with future expansion to families and teams—the app lets users swipe through movies/TV series to define both individual and mutual viewing preferences.

## Features

- **Authentication**: Email/password, Google, and Apple sign-in options
- **Group Management**: Create groups with unique join codes that can be shared
- **Genre Survey**: Initial genre preference selection to personalize recommendations
- **Tinder-style Swiping**: Swipe right to like, left to dislike
- **Matching Algorithm**: Identifies when all group members like the same movie
- **Content Filters**: Filter by ratings, genres, and content type (movies/TV)
- **Responsive Design**: Mobile-first with desktop support

## Technical Stack

- **Frontend**: React with Next.js
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Firebase (Authentication, Firestore)
- **Movie Data**: TMDB API (primary) and OMDB API (secondary)
- **Authentication**: Email/password, Google, and Apple sign-in

## Project Structure

```
dinomatch/
├── public/                  # Static assets
│   └── assets/              # Images and other media
│       └── logo.svg         # DinoMatch dinosaur logo
├── src/
│   ├── assets/              # Source assets
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Basic UI elements
│   │   ├── AuthForms.js     # Authentication forms
│   │   ├── GenreSurvey.js   # Genre selection component
│   │   ├── GroupManagement.js # Group management UI
│   │   ├── Navbar.js        # Navigation bar
│   │   └── SwipeCard.js     # Movie swiping component
│   ├── contexts/            # React context providers
│   │   ├── AuthContext.js   # Authentication state
│   │   ├── GroupContext.js  # Group management state
│   │   └── ToastContext.js  # Notification system
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Application pages
│   │   ├── AuthPage.js      # Login/signup page
│   │   ├── DashboardPage.js # Main dashboard
│   │   ├── FiltersPage.js   # Content filters
│   │   ├── GenreSurveyPage.js # Genre preferences
│   │   ├── GroupPage.js     # Group management
│   │   └── MatchPage.js     # Movie matching
│   ├── services/            # API and service integrations
│   │   ├── firebase.js      # Firebase configuration
│   │   └── mockMovieApi.js  # Mock movie data service
│   ├── styles/              # Global styles
│   │   └── globals.css      # Tailwind imports and global CSS
│   ├── utils/               # Utility functions
│   ├── App.js               # Main application component
│   └── index.js             # Application entry point
├── .env.example             # Example environment variables
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
├── hosting_instructions.md  # Deployment guide
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── testing_report.md        # Test results and verification
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Firebase account
- TMDB API key and access token
- OMDB API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd dinomatch
   npm install
   ```
3. Create a `.env.local` file with the following configuration:
   ```bash
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

   # Movie APIs
   NEXT_PUBLIC_TMDB_API_KEY=smth
   NEXT_PUBLIC_TMDB_ACCESS_TOKEN=smth
   NEXT_PUBLIC_OMDB_API_KEY=smth
   ```

4. Initialize Firebase:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
   Select:
   - Firestore
   - Authentication
   - Hosting

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

## Deployment

See `hosting_instructions.md` for detailed deployment instructions for:
- Firebase Hosting
- Vercel
- Netlify

## Testing the Application

1. **Authentication Testing**:
   - Create a new account using email/password
   - Try signing in with Google
   - Test Apple authentication if on iOS
   - Verify email verification flow

2. **Group Management**:
   - Create a new group
   - Copy and share the join code
   - Join an existing group using a code
   - Test group preferences

3. **Movie Features**:
   - Complete the genre survey
   - Try the movie swipe interface
   - Test filters (rating, genre, content type)
   - Verify match notifications

4. **API Integration**:
   - The app uses OMDB API as primary source (1,000 daily limit)
   - Automatically falls back to TMDB API when limit is reached

## Features Status

✅ Implemented:
- Authentication (Email, Google, Apple)
- Group Management with join codes
- Genre Survey and Preferences
- Movie Swipe Interface
- Matching Algorithm
- Content Filters (rating, genre, type)
- Streaming Platform Information
- Watch Provider Information
- OMDB/TMDB API Integration
- Mobile-First Responsive Design

🔄 In Progress:
- Enhanced recommendation algorithms
- Viewing history improvements
- Group voting system refinements

🔜 Planned:
- Additional streaming platforms
- Personalized recommendations
- Social features and sharing

## License

This project is licensed under the MIT License - see the LICENSE file for details.
