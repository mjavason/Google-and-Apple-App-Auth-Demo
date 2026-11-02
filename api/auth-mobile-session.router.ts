import { Request, Response, Router } from 'express';
import { randomBytes } from 'node:crypto';
import { adminAuth } from './firebase.config';

const router = Router();

const SESSION_TTL = 2 * 60 * 1000;

type AuthenticatedUser = {
  uid: string;
  email: string | null;
  name: string | null;
  photo: string | null;
};

type AuthSession = {
  status: 'pending' | 'completed';
  user?: AuthenticatedUser;
  expiresAt: number;
};

const sessions = new Map<string, AuthSession>();

function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

function getValidSession(sessionId: string): AuthSession | undefined {
  const session = sessions.get(sessionId);

  if (!session) return undefined;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return undefined;
  }

  return session;
}

// Create a session
router.post('/mobile/session', (_req: Request, res: Response) => {
  const sessionId = generateSessionId();

  sessions.set(sessionId, {
    status: 'pending',
    expiresAt: Date.now() + SESSION_TTL,
  });

  res.status(201).json({
    success: true,
    sessionId,
  });
});

// Complete a session after verifying the Firebase ID token
router.post('/mobile/complete', async (req: Request, res: Response) => {
  try {
    const { sessionId, idToken } = req.body;

    if (typeof sessionId !== 'string' || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'sessionId and idToken are required.',
      });
    }

    const session = getValidSession(sessionId);

    if (!session || session.status !== 'pending') {
      return res.status(404).json({
        success: false,
        message: 'Invalid, expired, or already completed session.',
      });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);

    const firebaseUser = await adminAuth.getUser(decoded.uid);

    session.user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? null,
      name: firebaseUser.displayName ?? null,
      photo: firebaseUser.photoURL ?? null,
    };

    session.status = 'completed';

    return res.json({ success: true });
  } catch (error) {
    console.error('Mobile session completion error:', error);

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
});

// Retrieve and consume the completed session

router.post('/mobile/redeem', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (typeof sessionId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'sessionId is required.',
    });
  }

  const session = getValidSession(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found or expired.',
    });
  }

  if (session.status === 'pending') {
    return res.status(202).json({
      success: false,
      status: 'pending',
    });
  }

  if (!session.user) {
    return res.status(500).json({
      success: false,
      message: 'Session has no authenticated user.',
    });
  }

  const user = session.user;

  sessions.delete(sessionId);

  return res.json({
    success: true,
    user,
  });
});


export default router;
