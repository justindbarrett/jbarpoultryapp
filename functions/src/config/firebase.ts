import * as admin from "firebase-admin";
import "dotenv/config";

require("dotenv").config();
admin.initializeApp({
    credential: admin.credential.cert({
        privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
    }),
    databaseURL: "https://jbar-poultry-web-app.firebase.io.com",
});

const db = admin.firestore();

export {admin, db};
