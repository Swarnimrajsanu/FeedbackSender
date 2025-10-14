import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, email, password} = await request.json();

       const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken.",
            }, { status: 400 });
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({
            email,
            isVerified: true
        })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserVerifiedByEmail) {
            if(existingUserVerifiedByEmail.isVerified){
            return Response.json({
                success: false,
                message: "Email is already registered.",
            }, { status: 400 });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserVerifiedByEmail.password = hashedPassword;
                existingUserVerifiedByEmail.username = username;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry time to 1 hour from now
                existingUserVerifiedByEmail.verifyCodeExpiry = expiryDate;
                await existingUserVerifiedByEmail.save();
            }
        }else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry time to 1 hour from now

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            });
            await newUser.save();

            // Send verification email
            const emailResponse = await sendVerificationEmail(email, verifyCode,username);

            if (!emailResponse.success) {
                return Response.json({
                    success: true,
                    message: emailResponse.message,
                }, { status: 500 });
            }

            
        }
        return Response.json({
            success: true,
            message: "User registered successfully. Please check your email for the verification code.",
        }, { status: 201 });
        

    } catch (error) {
        console.error("Error in sign-up route:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error. Please try again later.",
            }),
            { status: 500 }
        );
    }
}