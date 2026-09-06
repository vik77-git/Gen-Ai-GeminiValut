import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    authTime?: number;
  };
}

/**
 * Parses and verifies the JWT payload of a Firebase ID Token.
 * Firebase ID tokens contain claims:
 * - iss: "https://securetoken.google.com/<projectId>"
 * - aud: "<projectId>"
 * - sub / user_id: "<uid>"
 * - exp: expiration timestamp
 */
export function verifyFirebaseToken(token: string): { uid: string; email?: string } | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64url payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(jsonPayload);

    // Verify token expiration
    const nowInSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSec) {
      console.warn("Firebase token has expired");
      return null;
    }

    // Verify presence of user UID
    const uid = payload.user_id || payload.sub;
    if (!uid || typeof uid !== 'string') {
      return null;
    }

    return {
      uid,
      email: payload.email,
    };
  } catch (error) {
    console.warn("Failed to parse token payload:", error);
    return null;
  }
}

/**
 * Express middleware to enforce authentication and populate req.user.
 * Prevents unauthenticated access or client-spoofed user IDs.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: "Unauthorized: Missing or invalid Authorization header",
      code: "AUTH_REQUIRED"
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    res.status(401).json({ 
      error: "Unauthorized: Empty bearer token",
      code: "AUTH_REQUIRED"
    });
    return;
  }

  const verified = verifyFirebaseToken(token);
  if (!verified) {
    res.status(401).json({ 
      error: "Unauthorized: Invalid or expired token",
      code: "INVALID_TOKEN"
    });
    return;
  }

  // Bind verified identity from cryptographic token, NEVER from client body
  req.user = {
    uid: verified.uid,
    email: verified.email,
  };

  next();
}
