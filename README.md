# Location Scheduler

Location Scheduler is an application to help you organize and manage your production's Location Department's itineraries for scouts to technical surveys efficiently, all designed by a location manager and his dog.

## Features

### Authentication
- **Google OAuth Login**: Secure authentication using Google accounts via Passport.js
- **Traditional Login**: Email/password login option (demo mode available)
- **Session Management**: Persistent sessions with automatic authentication status checks
- **Profile Display**: Shows user's Google profile picture and name when logged in
- **Responsive Design**: Login interface works seamlessly on desktop and mobile devices

### Components
- **Header Component**: Integrated navigation bar with authentication UI
- **Login Component**: Modal-based login with Google OAuth and traditional options
- **Responsive Layout**: Optimized for various screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- Google OAuth credentials (see setup guide below)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd capstone-project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Then update `.env` with your credentials:
- MongoDB URI
- Google OAuth Client ID and Secret
- Session Secret

**For detailed Google OAuth setup instructions, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**

4. **Start the application**

Option A - Using the start script (macOS):
```bash
./start.sh
```

Option B - Manual start:
```bash
# Terminal 1 - Backend
npm run start:server

# Terminal 2 - Frontend
npm start
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## 🔐 Google OAuth Setup

To enable Google login:

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8080/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

**Full instructions: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**

## 📚 Documentation

- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Complete Google OAuth setup guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler
- `GET /api/auth/user` - Get current authenticated user
- `GET /api/auth/logout` - Logout current user

### Data
- `GET /api/hello` - Test endpoint with sample data

## Technology Stack

### Frontend
- React 19.2.0
- React Router
- Custom authentication components

### Backend
- Express 5.1.0
- Passport.js 0.7.0
- Passport Google OAuth 2.0
- Express Session
- MongoDB 6.20.0
- Mongoose 8.19.1

## Development

### Project Structure
```
capstone-project/
├── config/
│   └── passport.js          # Passport Google OAuth configuration
├── src/
│   ├── components/
│   │   ├── Header.js        # Header with auth UI
│   │   ├── Header.css
│   │   ├── Login.js         # Login modal component
│   │   └── Login.css
│   ├── models/
│   │   ├── userSchema.js
│   │   └── itinerarySchema.js
│   ├── App.js
│   └── index.js
├── server.js                # Express server with Passport
├── .env                     # Environment variables (not in git)
├── .env.example             # Template for .env
└── package.json
```

### Available Scripts

#### `npm start`
Runs the React app in development mode at http://localhost:3000

#### `npm run start:server`
Runs the Express backend server at http://localhost:8080

#### `npm run build`
Builds the React app for production

#### `npm test`
Launches the test runner

## Security Notes

- Never commit `.env` file to version control
- Use strong session secrets in production
- Enable HTTPS in production
- Set `NODE_ENV=production` in production environments
- Configure CORS properly for production domains

## Testing the Login

### Demo Login (without Google OAuth):
- Click "Login"
- Enter any username
- Use password: `password`
- Click "Login"

### Google OAuth Login:
1. Ensure Google OAuth is configured in `.env`
2. Click "Login"
3. Click "Continue with Google"
4. Select your Google account
5. Grant permissions
6. You'll be redirected back, logged in!

## Troubleshooting

### Google OAuth "Redirect URI mismatch"
- Verify the callback URL in Google Console matches exactly
- Check for trailing slashes
- Ensure port number is included for localhost

### Session not persisting
- Check that `SESSION_SECRET` is set in `.env`
- Verify cookie settings in browser
- Ensure both servers are running

### Cannot find module errors
- Run `npm install` to install all dependencies
- Check that all files in `/config` directory exist

For more troubleshooting tips, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
