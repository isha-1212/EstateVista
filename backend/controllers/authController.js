import { auth, db } from '../config/firebase.js';

const allowedRoles = ['user', 'realtor'];

const buildUserResponse = (uid, userData) => ({
  id: uid,
  name: userData.name,
  email: userData.email,
  phone: userData.phone,
  role: userData.role,
  avatar: userData.avatar || '',
});

// Signup Controller
export const signup = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Validate input
    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: email, password, name, phone',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 6 characters',
      });
    }

    const selectedRole = role || 'user';
    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        error: true,
        message: 'Role must be either user or realtor',
      });
    }

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    const userData = {
      id: userRecord.uid,
      email,
      name,
      phone,
      role: selectedRole,
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store user data in Realtime Database
    await db.ref(`users/${userRecord.uid}`).set(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: buildUserResponse(userRecord.uid, userData),
    });
  } catch (error) {
    console.error('Signup error:', error.message);

    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        error: true,
        message: 'Email already in use',
      });
    }

    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        error: true,
        message: 'Invalid email address',
      });
    }

    res.status(500).json({
      error: true,
      message: 'Signup failed: ' + error.message,
    });
  }
};

// Login Controller (Firebase ID token)
export const login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: true,
        message: 'Firebase ID token is required',
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch user data from Realtime Database
    const userSnapshot = await db.ref(`users/${uid}`).get();
    if (!userSnapshot.exists()) {
      return res.status(404).json({
        error: true,
        message: 'User profile not found in database',
      });
    }

    const userData = userSnapshot.val();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: buildUserResponse(uid, userData),
      token: idToken,
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(401).json({
      error: true,
      message: 'Invalid or expired Firebase ID token',
    });
  }
};

