import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./dbConnect";
import User from "../models/User";

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const SESSION_TIMEOUT = 7 * 24 * 60 * 60;

function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input.trim().toLowerCase().replace(/[<>\"'&]/g, "");
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePassword(password) {
  if (password.length < 6) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const typesCount = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  return typesCount >= 2;
}

function isLoginRateLimited(email) {
  const attempts = loginAttempts.get(email) || [];
  const now = Date.now();
  const recentAttempts = attempts.filter((time) => now - time < 60000);
  if (recentAttempts.length >= 3) return true;
  recentAttempts.push(now);
  loginAttempts.set(email, recentAttempts);
  return false;
}

function isAccountLocked(email) {
  const lockData = loginAttempts.get(`locked_${email}`);
  if (!lockData) return false;
  const { lockedUntil, attempts } = lockData;
  if (Date.now() > lockedUntil) {
    loginAttempts.delete(`locked_${email}`);
    return false;
  }
  return attempts >= MAX_LOGIN_ATTEMPTS;
}

function lockAccount(email) {
  const lockedUntil = Date.now() + LOCKOUT_DURATION;
  loginAttempts.set(`locked_${email}`, {
    lockedUntil,
    attempts: (loginAttempts.get(`locked_${email}`)?.attempts || 0) + 1,
  });
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          const email = sanitizeInput(credentials?.email);
          const password = credentials?.password;

          if (!email || !password) return null;
          if (!validateEmail(email)) return null;
          if (!validatePassword(password)) return null;
          if (isLoginRateLimited(email)) throw new Error("Too many login attempts. Please try again later.");
          if (isAccountLocked(email)) {
            const lockData = loginAttempts.get(`locked_${email}`);
            const remainingTime = Math.ceil((lockData.lockedUntil - Date.now()) / 1000 / 60);
            throw new Error(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
          }

          const user = await User.findOne({ email }).select("+password");
          if (!user) {
            lockAccount(email);
            return null;
          }

          if (user.status === "inactive" || user.status === "suspended")
            throw new Error("Account is inactive. Please contact support.");

          if (user.emailVerification && !user.emailVerified)
            throw new Error("Please verify your email address before logging in.");

          const isValid = await user.matchPassword(password);
          if (!isValid) {
            lockAccount(email);
            return null;
          }

          loginAttempts.delete(email);
          loginAttempts.delete(`locked_${email}`);

          const lastLogin = user.lastLogin || new Date(0);
          const daysSinceLastLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceLastLogin > 90) {}

          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            loginCount: (user.loginCount || 0) + 1,
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin || false,
            status: user.status,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        if (trigger === "update") {
          await dbConnect();
          const updatedUser = await User.findById(token.id).select("-password");
          if (updatedUser) {
            token.name = updatedUser.name;
            token.email = updatedUser.email;
            token.isAdmin = updatedUser.isAdmin || false;
            token.status = updatedUser.status;
          }
        }
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.isAdmin = user.isAdmin || false;
          token.status = user.status;
          token.loginTime = Date.now();
        }
        if (token.isAdmin && token.loginTime) {
          const tokenAge = Date.now() - token.loginTime;
          const maxAge = 24 * 60 * 60 * 1000;
          if (tokenAge > maxAge) return null;
        }
        return token;
      } catch (error) {
        return null;
      }
    },
    async session({ session, token }) {
      try {
        if (token?.id) {
          session.user.id = token.id;
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.isAdmin = token.isAdmin || false;
          session.user.status = token.status;
          session.user.image = token.image;
          session.user.loginTime = token.loginTime;
        }
        return session;
      } catch {
        return null;
      }
    },
  },
  events: {
    async signOut() {},
    async signIn() {},
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_TIMEOUT,
    updateAge: 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
