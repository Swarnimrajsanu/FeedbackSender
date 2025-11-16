import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { signUpSchema } from "@/schemas/signupSchema";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    await dbConnect();

    try {
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return Response.json({
                success: false,
                message: 'Invalid JSON in request body',
            }, { status: 400 });
        }
        
        // Validate input data
        const validationResult = signUpSchema.safeParse(body);
        
        if (!validationResult.success) {
            const errors = validationResult.error.format();
            const errorMessages: string[] = [];
            
            if (errors.username?._errors) {
                errorMessages.push(...errors.username._errors);
            }
            if (errors.email?._errors) {
                errorMessages.push(...errors.email._errors);
            }
            if (errors.password?._errors) {
                errorMessages.push(...errors.password._errors);
            }
            
            return Response.json({
                success: false,
                message: errorMessages.length > 0 
                    ? errorMessages.join(', ') 
                    : 'Invalid input data',
            }, { status: 400 });
        }
        
        const {username, email, password} = validationResult.data;
        
        console.log('Sign-up attempt:', { username, email });

        // Check if username is already taken
        const existingUserByUsername = await UserModel.findOne({ username });

        if (existingUserByUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken.",
            }, { status: 400 });
        }

        // Check if email is already registered
        const existingUserByEmail = await UserModel.findOne({ email });

        if (existingUserByEmail) {
            return Response.json({
                success: false,
                message: "Email is already registered.",
            }, { status: 400 });
        }

        // Create new user with verified status
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            isVerified: true,
            isAcceptingMessages: true,
            messages: [],
        });
        await newUser.save();
        
        return Response.json({
            success: true,
            message: "User registered successfully. You can now sign in.",
        }, { status: 201 });
        

    } catch (error) {
        console.error("Error in sign-up route:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        return Response.json({
            success: false,
            message: error instanceof Error && error.message.includes('duplicate key') 
                ? "Username or email is already taken."
                : "Internal server error. Please try again later.",
        }, { status: 500 });
    }
}