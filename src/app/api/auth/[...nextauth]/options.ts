import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/user.model';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      _id: string;
      isVerified: boolean;
      isAcceptingMessages: boolean;
      username: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    username: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: { identifier?: string; password?: string } | undefined) {
        await dbConnect();
        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error('Email/username and password are required');
          }

          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error('No user found with this email');
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            const userId = user._id?.toString() || '';
            return {
              id: userId,
              _id: userId,
              username: user.username,
              email: user.email,
              isVerified: user.isVerified,
              isAcceptingMessages: user.isAcceptingMessages,
            };
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: unknown) {
          const error = err as Error | { message?: string };
          throw new Error(error instanceof Error ? error.message : String(error));
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};