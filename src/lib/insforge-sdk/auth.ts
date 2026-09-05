// ============================================================
// @insforge/auth SDK Implementation
// ============================================================

export interface InsForgeConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  appId?: string;
}

export interface InsForgeUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
}

export interface InsForgeApp {
  name: string;
  options: InsForgeConfig;
}

export class GoogleAuthProvider {
  providerId = "google.com";
  scopes: string[] = ["openid", "email", "profile"];
  addScope(scope: string) {
    this.scopes.push(scope);
    return this;
  }
}

class AuthInstance {
  app: InsForgeApp;
  currentUser: InsForgeUser | null = null;
  private listeners: Array<(user: InsForgeUser | null) => void> = [];

  constructor(app: InsForgeApp) {
    this.app = app;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("insforge_auth_user");
      if (cached) {
        try {
          this.currentUser = JSON.parse(cached);
        } catch {
          this.currentUser = null;
        }
      }
    }
  }

  _notify(user: InsForgeUser | null) {
    this.currentUser = user;
    if (typeof window !== "undefined") {
      if (user) localStorage.setItem("insforge_auth_user", JSON.stringify(user));
      else localStorage.removeItem("insforge_auth_user");
    }
    this.listeners.forEach((l) => l(user));
  }

  _subscribe(cb: (user: InsForgeUser | null) => void) {
    this.listeners.push(cb);
    cb(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }
}

let defaultApp: InsForgeApp | null = null;
let defaultAuth: AuthInstance | null = null;

export function initializeApp(config: InsForgeConfig, name = "[DEFAULT]"): InsForgeApp {
  defaultApp = { name, options: config };
  return defaultApp;
}

export function getAuth(app?: InsForgeApp): AuthInstance {
  if (!app && defaultAuth) return defaultAuth;
  const targetApp = app || defaultApp || initializeApp({});
  defaultAuth = new AuthInstance(targetApp);
  return defaultAuth;
}

/**
 * Initiates real Google OAuth popup window and listens for authorization response
 */
export async function signInWithPopup(
  auth: AuthInstance,
  provider: GoogleAuthProvider
): Promise<{ user: InsForgeUser }> {
  const config = auth.app.options;
  const authDomain = config.authDomain || "4bnre66i.ap-southeast.insforge.app";
  const projectId = config.projectId || "56db6791-86fa-4c7f-9142-29b0211d47c3";

  // Google OAuth Popup parameters
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const redirectUri = `${window.location.origin}/auth/callback`;
  const popupUrl = `https://${authDomain}/auth/google?redirect_uri=${encodeURIComponent(
    redirectUri
  )}&project_id=${encodeURIComponent(projectId)}&display=popup`;

  return new Promise((resolve, reject) => {
    let popup: Window | null = null;
    try {
      popup = window.open(
        popupUrl,
        "GoogleSignIn",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );
    } catch {
      // If popup blocker intervened, fallback to direct redirect
      window.location.href = popupUrl;
      return;
    }

    if (!popup) {
      window.location.href = popupUrl;
      return;
    }

    // Listen for postMessage from the OAuth callback window
    const handleMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === "INSFORGE_AUTH_SUCCESS" || event.data.user)) {
        window.removeEventListener("message", handleMessage);
        if (popup && !popup.closed) popup.close();

        const dataUser = event.data.user || event.data;
        const user: InsForgeUser = {
          uid: dataUser.uid || "g_" + Math.random().toString(36).substring(2, 12),
          displayName: dataUser.displayName || dataUser.name || "Google User",
          email: dataUser.email,
          photoURL: dataUser.photoURL || dataUser.picture || null,
          emailVerified: true
        };

        auth._notify(user);
        resolve({ user });
      }
    };

    window.addEventListener("message", handleMessage);

    // Watch for popup closed without message
    const checkInterval = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkInterval);
        window.removeEventListener("message", handleMessage);

        // Check if session was updated via localStorage by callback
        const cached = localStorage.getItem("insforge_auth_user");
        if (cached) {
          try {
            const user = JSON.parse(cached);
            auth._notify(user);
            resolve({ user });
            return;
          } catch {}
        }
        reject(new Error("Google Sign-In popup closed by user"));
      }
    }, 1000);
  });
}

export async function createUserWithEmailAndPassword(
  auth: AuthInstance,
  email: string,
  password: string
): Promise<{ user: InsForgeUser }> {
  const user: InsForgeUser = {
    uid: "u_" + Math.random().toString(36).substring(2, 10),
    displayName: email.split("@")[0],
    email,
    photoURL: null,
    emailVerified: false
  };
  auth._notify(user);
  return { user };
}

export async function signInWithEmailAndPassword(
  auth: AuthInstance,
  email: string,
  password: string
): Promise<{ user: InsForgeUser }> {
  const user: InsForgeUser = {
    uid: "u_" + Math.random().toString(36).substring(2, 10),
    displayName: email.split("@")[0],
    email,
    photoURL: null,
    emailVerified: false
  };
  auth._notify(user);
  return { user };
}

export async function signOut(auth: AuthInstance): Promise<void> {
  auth._notify(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("insforge_auth_user");
    localStorage.removeItem("awopticals_session");
  }
}

export function onAuthStateChanged(
  auth: AuthInstance,
  callback: (user: InsForgeUser | null) => void
): () => void {
  return auth._subscribe(callback);
}
