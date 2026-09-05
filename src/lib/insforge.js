import { initializeApp, getAuth, GoogleAuthProvider, signInWithPopup } from '@insforge/auth';

const insforgeConfig = {
  apiKey: process.env.NEXT_PUBLIC_INSFORGE_API_KEY || "ik_2d0ab4978c75f9e7f7e0e24e190ef1d6",
  authDomain: process.env.NEXT_PUBLIC_INSFORGE_AUTH_DOMAIN || "4bnre66i.ap-southeast.insforge.app",
  projectId: process.env.NEXT_PUBLIC_INSFORGE_PROJECT_ID || "56db6791-86fa-4c7f-9142-29b0211d47c3",
  appId: process.env.NEXT_PUBLIC_INSFORGE_APP_ID || "alpha-watch-opticals"
};

const app = initializeApp(insforgeConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, GoogleAuthProvider };
