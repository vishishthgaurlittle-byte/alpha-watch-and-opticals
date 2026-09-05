import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

const COOKIE_NAME = "aw_session";
const AUTH_SECRET = process.env.AUTH_SECRET || "alpha_secure_jwt_session_secret_key_2026_production";

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: string; // "customer" | "admin"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: "30d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setServerSession(user: { id: string; email: string; name: string; role: string }) {
  const token = signSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  });
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

    if (!user || user.blocked) return null;
    return user;
  } catch (err) {
    console.warn("Prisma getCurrentUser fallback to session payload:", err);
    return {
      id: session.id,
      name: session.name,
      email: session.email,
      phone: null,
      role: session.role,
      avatar: null,
      blocked: false,
      themePreference: null,
      createdAt: new Date()
    };
  }
}
