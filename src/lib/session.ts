import { SessionOptions } from "iron-session";
import { SessionData } from "@/types";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: process.env.SESSION_COOKIE_NAME || "admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export type { SessionData };
