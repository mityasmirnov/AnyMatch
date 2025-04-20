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
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Movie Data**: Mock API (ready for TMDB API integration)

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

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd dinomatch
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your Firebase configuration
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

See `hosting_instructions.md` for detailed deployment instructions for:
- Firebase Hosting
- Vercel
- Netlify

## TMDB API Integration

The application currently uses a mock movie API service. To integrate with the real TMDB API:

1. Register for a TMDB account at https://www.themoviedb.org/signup
2. Request an API key from your account settings
3. Add your API key to the `.env` file:
   ```
   REACT_APP_TMDB_API_KEY=your_api_key
   ```
4. Replace the mock API service with the real TMDB API client

## Future Enhancements

- Watchlist management
- Viewing history tracking
- Additional streaming platform information
- Enhanced recommendation algorithms
- Support for larger groups with voting systems

## License

This project is licensed under the MIT License - see the LICENSE file for details.
