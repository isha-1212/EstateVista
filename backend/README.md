# EstateVista Backend - Express.js + Firebase

EstateVista

---

## 📋 Project Structure

```
backend/
├── config/
│   └── firebase.js              # Firebase Admin SDK configuration
├── middleware/
│   └── authMiddleware.js        # JWT/Token authentication middleware
├── controllers/
│   ├── authController.js        # Signup, Login, Logout logic
│   ├── propertyController.js    # Property CRUD operations
│   ├── inquiryController.js     # Inquiry management logic
│   └── userController.js        # User profile management
├── routes/
│   ├── authRoutes.js            # Authentication endpoints
│   ├── propertyRoutes.js        # Property endpoints
│   ├── inquiryRoutes.js         # Inquiry endpoints
│   └── userRoutes.js            # User endpoints
├── server.js                    # Main Express server
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
└── .env                         # Environment variables (create this)
```

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Authentication (Email/Password)
4. Create a Realtime Database
5. Download service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as JSON file

### Step 3: Configure Environment Variables

1. Create `.env` file in backend folder
2. Copy contents from `.env.example`
3. Fill in your Firebase credentials from service account JSON:

```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your_client_cert_url
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

PORT=5000
NODE_ENV=development
```

### Step 4: Set Firebase Database Rules

Go to Firebase Console → Realtime Database → Rules and set:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || true",
        ".write": "$uid === auth.uid"
      }
    },
    "properties": {
      ".read": true,
      ".write": "auth != null",
      "$propertyId": {
        ".read": true,
        ".write": "root.child('properties').child($propertyId).child('realtorId').val() === auth.uid"
      }
    },
    "inquiries": {
      ".read": "auth != null",
      ".write": true,
      "$inquiryId": {
        ".read": "root.child('inquiries').child($inquiryId).child('realtorId').val() === auth.uid || auth != null"
      }
    }
  }
}
```

### Step 5: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

---

## 📡 API ENDPOINTS

### Health Check
```
GET /health
```

### Authentication

#### Signup
```
POST /api/auth/signup
Body: {
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+91 98765 43210",
  "role": "user" or "realtor"
}
```

#### Login
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout
```
POST /api/auth/logout
```

---

### Properties (Public endpoints don't need auth)

#### Get All Properties
```
GET /api/properties
Query: ?search=villa&location=Kochi&propertyType=villa&listingType=sale&bedrooms=2&page=1&limit=10
```

#### Get Single Property
```
GET /api/properties/:id
```

#### Get Properties by Realtor
```
GET /api/properties/realtor/:realtorId
```

#### Create Property (Protected - Realtor only)
```
POST /api/properties
Headers: Authorization: Bearer <token>
Body: {
  "title": "Luxury Villa",
  "description": "Beautiful villa with 4 bedrooms...",
  "price": 5000000,
  "location": "Kochi",
  "address": "123 Main Street, Kochi",
  "propertyType": "villa",
  "listingType": "sale",
  "bedrooms": 4,
  "bathrooms": 3,
  "area": 4500,
  "amenities": ["Swimming Pool", "Gym", "Garden"],
  "images": ["url1", "url2"]
}
```

#### Update Property (Protected - Owner only)
```
PUT /api/properties/:id
Headers: Authorization: Bearer <token>
Body: { same as create }
```

#### Delete Property (Protected - Owner only)
```
DELETE /api/properties/:id
Headers: Authorization: Bearer <token>
```

---

### Inquiries

#### Create Inquiry (Public)
```
POST /api/inquiries
Body: {
  "name": "John Buyer",
  "email": "buyer@example.com",
  "phone": "+91 98765 43210",
  "message": "I'm interested in this property",
  "propertyId": "property_id"
}
```

#### Get All Inquiries (Protected - Realtor only)
```
GET /api/inquiries
Headers: Authorization: Bearer <token>
Query: ?status=new (optional)
```

#### Get Single Inquiry (Protected - Owner only)
```
GET /api/inquiries/:id
Headers: Authorization: Bearer <token>
```

#### Update Inquiry Status (Protected - Owner only)
```
PUT /api/inquiries/:id
Headers: Authorization: Bearer <token>
Body: {
  "status": "new" or "contacted" or "closed"
}
```

---

### Users

#### Get Current User (Protected)
```
GET /api/users/me
Headers: Authorization: Bearer <token>
```

#### Update User Profile (Protected)
```
PUT /api/users/me
Headers: Authorization: Bearer <token>
Body: {
  "name": "Updated Name",
  "phone": "+91 98765 43210",
  "avatar": "url_to_avatar"
}
```

#### Get User by ID (Public - for realtor profile)
```
GET /api/users/:userId
```

---

## 🔒 Authentication

All protected endpoints require an `Authorization` header with a Firebase token:

```
Authorization: Bearer <firebase_id_token>
```

How to get token from frontend:
```javascript
// React example
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await userCredential.user.getIdToken();

// Use token in API calls
const response = await fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📊 Firebase Database Structure

### Users Collection
```
users/
  {userId}/
    id: string
    email: string
    name: string
    phone: string
    role: "user" | "realtor"
    avatar: string
    createdAt: timestamp
```

### Properties Collection
```
properties/
  {propertyId}/
    id: string
    title: string
    description: string
    price: number
    location: string
    address: string
    propertyType: "apartment" | "villa" | "commercial" | "land"
    listingType: "rent" | "sale"
    bedrooms: number
    bathrooms: number
    area: number
    amenities: [string]
    images: [string]
    realtorId: string
    createdAt: timestamp
    updatedAt: timestamp
```

### Inquiries Collection
```
inquiries/
  {inquiryId}/
    id: string
    name: string
    email: string
    phone: string
    message: string
    propertyId: string
    propertyTitle: string
    realtorId: string
    status: "new" | "contacted" | "closed"
    createdAt: timestamp
```

---

## 🐛 Error Handling

All error responses follow this format:

```json
{
  "error": true,
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 🧪 Testing with Postman

1. **Signup** → Get token
2. **Login** → Get token
3. **Create Property** → Use token in header
4. **Get Properties** → No auth needed
5. **Get Inquiries** → Use token in header

Example Postman header for protected routes:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ik5UaEJkVEJ...
```

---

## 📝 Code Examples

### Using API from React Frontend

```javascript
// Signup
const signupUser = async (email, password, name, phone, role) => {
  const response = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, phone, role })
  });
  const data = await response.json();
  return data;
};

// Get Properties
const getProperties = async (search = '', location = '') => {
  const query = new URLSearchParams({
    search,
    location
  });
  const response = await fetch(`http://localhost:5000/api/properties?${query}`);
  const data = await response.json();
  return data.data;
};

// Create Property (Protected)
const createProperty = async (token, propertyData) => {
  const response = await fetch('http://localhost:5000/api/properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(propertyData)
  });
  const data = await response.json();
  return data;
};

// Get Current User (Protected)
const getCurrentUser = async (token) => {
  const response = await fetch('http://localhost:5000/api/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data;
};
```

---

## ⚠️ Important Notes

1. **Firebase Credentials**: Never commit `.env` file with real credentials
2. **CORS**: Currently allowing all origins. Update in production
3. **Rate Limiting**: Not implemented. Add in production
4. **Input Validation**: Basic validation present. Enhance for production
5. **Database Rules**: Example rules provided. Review security rules before production

---

## 🔧 Troubleshooting

### Firebase connection fails
- Check `.env` credentials are correct
- Verify Firebase project exists and is active
- Check database URL format

### Auth errors
- Ensure token is valid and not expired
- Check Authorization header format: `Bearer <token>`
- Verify user has required permissions

### Property not found
- Check property ID is correct
- Verify property exists in database
- Check user permissions for updates/deletes

---

## 📚 Next Steps

1. Deploy backend to cloud (Firebase Cloud Functions, Heroku, AWS, etc.)
2. Add image upload functionality
3. Implement email notifications
4. Add search filters optimization
5. Implement pagination better
6. Add rate limiting
7. Add request validation middleware
8. Add request logging

---

**Backend is ready to use!** ✅ Connect it to your React frontend and start building. 🚀
