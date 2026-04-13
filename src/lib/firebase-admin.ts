import * as admin from "firebase-admin";

function getServiceAccount(): admin.ServiceAccount {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) throw new Error("FIREBASE_SERVICE_ACCOUNT env var is required");
  const parsed = JSON.parse(sa);
  if (parsed.private_key)
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  return parsed;
}

if (!admin.apps.length) {
  console.log(getServiceAccount());
  admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
  });
}

export const dbAdmin = admin.firestore();
export const fbApp = admin.app();
