# DinoMatch Hosting Instructions

## Overview
This document provides instructions for hosting the DinoMatch application. There are multiple options for hosting, including Firebase Hosting, Vercel, and Netlify. We'll cover the setup process for each option.

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git (optional, for version control)
- Firebase account (for Firebase Hosting)
- Vercel account (for Vercel hosting)
- Netlify account (for Netlify hosting)

## Option 1: Firebase Hosting (Recommended)

Firebase Hosting is recommended as it integrates seamlessly with the Firebase services used in the application.

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase in your project
```bash
cd dinomatch
firebase init
```
- Select "Hosting" when prompted for features
- Select your Firebase project
- Specify "build" as your public directory
- Configure as a single-page app: Yes
- Set up automatic builds and deploys with GitHub: No (unless you want to)

### Step 4: Build the application
```bash
npm run build
```

### Step 5: Deploy to Firebase
```bash
firebase deploy
```

After deployment, Firebase will provide a URL where your application is hosted.

## Option 2: Vercel

Vercel is a great option for hosting React applications with automatic deployments.

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy to Vercel
```bash
cd dinomatch
vercel
```

Follow the prompts to complete the deployment. Vercel will automatically detect that it's a Next.js application and set up the appropriate build configuration.

## Option 3: Netlify

Netlify is another excellent option for hosting static websites and React applications.

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify
```bash
netlify login
```

### Step 3: Build the application
```bash
npm run build
```

### Step 4: Deploy to Netlify
```bash
netlify deploy --prod
```

When prompted, specify "build" as the publish directory.

## Environment Configuration

Regardless of which hosting option you choose, you'll need to configure environment variables for your Firebase project.

### Firebase Configuration
Create a `.env` file in the root of your project with the following variables (replace with your actual Firebase config):

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### TMDB API Configuration
Once you obtain your TMDB API key, add it to your environment variables:

```
REACT_APP_TMDB_API_KEY=your_tmdb_api_key
```

## Custom Domain Setup

All three hosting options support custom domains. Refer to their respective documentation for setting up a custom domain:

- [Firebase Custom Domain Setup](https://firebase.google.com/docs/hosting/custom-domain)
- [Vercel Custom Domain Setup](https://vercel.com/docs/concepts/projects/domains)
- [Netlify Custom Domain Setup](https://docs.netlify.com/domains-https/custom-domains/)

## Troubleshooting

### Common Issues

1. **Build Errors**: If you encounter build errors, check the console output for specific error messages. Common issues include:
   - Missing dependencies
   - Syntax errors in your code
   - Environment variables not properly configured

2. **Deployment Errors**: If deployment fails, check:
   - Your authentication with the hosting provider
   - Build output directory configuration
   - Network connectivity

3. **Runtime Errors**: If the application deploys but doesn't work correctly:
   - Check browser console for JavaScript errors
   - Verify environment variables are correctly set
   - Ensure Firebase configuration is correct

### Getting Help

If you encounter issues not covered here, refer to:
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

## Maintenance and Updates

To update your deployed application:

1. Make changes to your code
2. Test locally
3. Build the application
4. Deploy using the same commands as above

Most hosting providers will only update the files that have changed, making updates quick and efficient.
