import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      username: string;
      isVerified: boolean;
      isAcceptingMessages: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    _id: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
  }

  interface JWT {
    _id?: string;
    username?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
  }
}
