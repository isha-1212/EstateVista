import admin from "firebase-admin";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

dotenv.config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require("./serviceAccountKey.json");

const databaseURL =
  process.env.FIREBASE_DATABASE_URL ||
  serviceAccount.databaseURL ||
  `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });
}

export const auth = admin.auth();
export const db = admin.database();

export default admin;

