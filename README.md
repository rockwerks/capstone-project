# 📍 Location Scheduler

A comprehensive web application designed for film production location departments to organize, manage, and share location itineraries efficiently. Built by a location manager to streamline the coordination of scouts, technical surveys, and location logistics.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

## 🎬 Overview

Location Scheduler helps film production teams manage complex multi-location shoots by providing:
- **Drag-and-drop itinerary creation** with flexible location ordering
- **Real-time status tracking** (completed, skipped, pending)  
- **Secure email sharing** with password protection
- **Production office integration** with start/end locations
- **Mobile-responsive design** for on-set access

## ✨ Key Features

### 📋 Itinerary Management
- Create, edit, and delete location itineraries
- Add unlimited locations per itinerary
- Drag and drop to reorder locations
- Set names, addresses, times, contacts, and notes
- Define production office as starting/ending locations
- Add new locations while editing existing itineraries

### ✅ Status Tracking
- Mark locations as **completed** (green indicator)
- Mark locations as **skipped** (red indicator)
- Reset to **pending** at any time
- Visual progress indicators with statistics
- Progress bar showing completion percentage
- Status persists across edits and shares

###  Secure Sharing
- Share itineraries via email
- Password-protected shared links
- Built-in password generator with strength indicator
- Beautiful, print-friendly shared view
- Recipients see real-time status updates

### 🔐 Authentication
- Google OAuth 2.0 integration
- Secure session management
- User-specific itinerary storage

### ⏰ Time Display
- 12-hour format with AM/PM
- Clear time ranges for each location

## 🛠 Technology Stack

**Frontend:** React 19.2.0, React Router 7.9.4, @dnd-kit, CSS3

**Backend:** Node.js, Express 5.1.0, Passport.js 0.7.0, Mongoose 8.19.1

**Database:** MongoDB Atlas

**Services:** Google OAuth 2.0, Gmail SMTP

**Security:** bcrypt 6.0.0, express-session, secure cookies

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Google OAuth credentials
- Gmail with App Password

### Setup

```bash
# Clone repository
git clone https://github.com/rockwerks/capstone-project.git
cd capstone-project

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure .env with your credentials

# Build React app
npm run build

# Start servers (development)
# Terminal 1:
npm run start:server

# Terminal 2:
PORT=3001 npm start
```

Access at: http://localhost:3001

## ⚙️ Configuration

Create `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
SESSION_SECRET=change-this-in-production
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=gmail-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
CLIENT_URL=http://localhost:3001
PORT=8080
NODE_ENV=development
```

## 🚀 Usage

### Creating an Itinerary
1. Log in with Google
2. Click "+ New Itinerary"
3. Fill in title and date
4. Add starting location (production office)
5. Click "+ Add Location" for each filming spot
6. Drag ⋮⋮ handle to reorder
7. Add ending location
8. Click "Create Itinerary"

### Tracking Progress
- Click **✓ Complete** when filming is done
- Click **⊘ Skip** if location can't be visited
- Click **↺ Reset** to clear status

### Sharing
1. Click "📤 Share"
2. Enter email addresses (comma-separated)
3. Generate or enter password
4. Click "Share Itinerary"
5. Recipients get secure link via email

## 📊 Database Schema

### User
```javascript
{
  googleId: String,
  name: String,
  email: String,
  createdAt: Date
}
```

### Itinerary
```javascript
{
  userId: ObjectId,
  title: String,
  date: Date,
  startLocation: { name, address, time },
  locations: [{
    setName, address,
    startTime, endTime,
    contactName, contactPhone,
    notes,
    status: 'pending'|'completed'|'skipped'
  }],
  endLocation: { name, address, time },
  shareToken: String,
  sharePassword: String,
  isShared: Boolean,
  sharedWith: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `GET /auth/google` - Initiate OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Log out

### Itineraries
- `GET /api/itineraries` - List user's itineraries
- `POST /api/itineraries` - Create itinerary
- `PUT /api/itineraries/:id` - Update itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary

### Sharing
- `POST /api/itineraries/:id/share` - Share via email
- `POST /api/itineraries/:id/unshare` - Unshare
- `POST /api/shared/:token` - Access shared (public)

## 🚢 Deployment
- Complete deployment to render.com

## 🧪 Testing

```bash
npm test
npm test -- --coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License

## 👤 Author

**Anth Wittrock**
- GitHub: [@rockwerks](https://github.com/rockwerks)
- Email: anth@rockwerks.ca

## 🙏 Acknowledgments

Built for film production location departments worldwide.  
Designed by a location manager and their dog 🐕

## 📞 Support

- Email: anth@rockwerks.ca
- Issues: Open an issue on GitHub

## 🗺 Roadmap

- [ ] Travel time calculator (requires better geocoding solution)
- [ ] Export to PDF
- [ ] Calendar integration
- [ ] Weather forecasts
- [ ] Photo attachments
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Team permissions
- [ ] Map view with route visualization

## 🔧 Troubleshooting

**Google OAuth "Redirect URI mismatch"**  
→ Verify callback URL in Google Console matches exactly

**Email sharing not working**  
→ Use Gmail App Password, not regular password  
→ Ensure EMAIL_USER and EMAIL_PASSWORD are set in environment

**Shared links show error**  
→ Verify CLIENT_URL is set correctly, run `npm run build`

**Port conflicts**  
→ Frontend: 3001, Backend: 8080. Use `lsof -i` to check

**Status changes not saving**  
→ Check MongoDB connection, verify user is authenticated

**Production office not showing on shared itinerary**  
→ Ensure start/end location addresses are filled in

---

**Built with ❤️ for the film production community** 🎬
