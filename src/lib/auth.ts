import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const COOKIE_NAME = "aw_session";
export const AUTH_SECRET = process.env.AUTH_SECRET || "alpha_secure_jwt_session_secret_key_2026_production";

export interface SessionPayload {
  sub: string;
  id: string;
  email: string;
  name: string;
  role: string; // "customer" | "admin"
  avatar?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(payload: {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}): string {
  const data: SessionPayload = {
    sub: payload.id,
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    avatar: payload.avatar || null
  };
  return jwt.sign(data, AUTH_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as any;
    if (!decoded || (!decoded.id && !decoded.sub)) return null;
    return {
      sub: decoded.sub || decoded.id,
      id: decoded.id || decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || "customer",
      avatar: decoded.avatar || null
    };
  } catch {
    return null;
  }
}

export async function setServerSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}) {
  const token = signSessionToken(user);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
  return token;
}

export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function clearServerSession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const session = await getServerSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        blocked: true,
        themePreference: true,
        createdAt: true
      }
    });

    if (!user || user.blocked) {
      if (user?.blocked) return null;
    } else {
      return user;
    }
  } catch (err) {
    console.warn("Prisma getCurrentUser fallback to session payload:", err);
  }

  return {
    id: session.id,
    name: session.name,
    email: session.email,
    phone: null,
    role: session.role,
    avatar: session.avatar || null,
    blocked: false,
    themePreference: null,
    createdAt: new Date()
  };
}
