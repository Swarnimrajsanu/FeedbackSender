import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";



export async function Post(request: Request) {
    await dbConnect();


    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({ username: decodedUsername, });
        if (!user) {
            return Response.json({
                message: "User not found",
                success: false,
            }, { status: 404 });
        }

        const isCodeValid = user.verifyCode === code;
        const iscodeNotExpired = user.verifyCodeExpiry && user.verifyCodeExpiry > new Date();
        
        if (isCodeValid || iscodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json({
                message: "Invalid or expired verification code",
                success: false,
            }, { status: 400 });
        } else if (!iscodeNotExpired) {
            return Response.json({
                message: "Verification code has expired",
                success: false,
            }, { status: 400 });
        } else {
            return Response.json({
                message: "incorrect verification code",
                success: true,
            }, { status: 200 });
        }

        
    } catch (error) {
        console.error("Error verifying user", error);
       return Response.json({
            message: "Internal server error",
            success: false,
       }, { status: 500 });
        
    }
}