import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: {label: "email", type: "text", placeholder: "Your email"},
                password: {label: "Password", type: "password", placeholder: "Your password"}
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            {email: credentials.email},
                            {username: credentials.email}
                        ]
                    })
                    if (!user) {
                        throw new Error('No user found with the given email or username');
                    }
                    if(!user.isVerified){
                        throw new Error('Email not verified. Please verify your email to login.');
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (isPasswordCorrect) {
                        return user;
                    }else{
                        throw new Error('Incorrect password');
                    }
                    
                } catch (err:any) {
                    throw new Error(err);
                    
                }

            }
        })
    ],

    callbacks: {
        async jwt({token, user,}) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id as string;
                session.user.isVerified = token.isVerified as boolean;
                session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
                session.user.username = token.username as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,


}