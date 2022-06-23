import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
	apiKey: "AIzaSyAHCtB0gD4Kgr3SjF0wSCBwKmvsoJ6KeEY",
	authDomain: "e-design-aa9eb.firebaseapp.com",
	projectId: "e-design-aa9eb",
	storageBucket: "e-design-aa9eb.appspot.com",
	messagingSenderId: "198069383748",
	appId: "1:198069383748:web:16fc682d3cd68efeb54211",
	measurementId: "G-Z0DVFG9V0S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const __storage = getStorage(app);
const __messaging = getMessaging(app);

export { db, __storage, __messaging };
