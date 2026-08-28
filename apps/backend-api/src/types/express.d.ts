declare global {
  namespace Express {
    interface Request {
      session?: {
        session: {
          id: string;
          userId: string;
          expiresAt: Date;
          token: string;
          createdAt: Date;
          updatedAt: Date;
        };
        user: {
          id: string;
          email: string;
          name: string;
          emailVerified: boolean;
          createdAt: Date;
          updatedAt: Date;
          image?: string | null;
          rol?: string | null;
          telefono?: string | null;
          mutualista?: string | null;
        };
      };
    }
  }
}

export {};
