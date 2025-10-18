import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";


export async function POST(request: Request) {
  await dbConnect();

   const session = await getServerSession(authOptions);
    const user = session?.user as User ;

    if (!session || !session.user) {
        return Response.json({
            message: "Unauthorized",
            success: false,
        }, { status: 401 });
    }

    const userId = user._id;
    const {assecptMessages} = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessages: assecptMessages},
            { new: true }
        )
        if (!updatedUser) {
            return Response.json({
                message: "User not found",
                success: false,
            }, { status: 401 });
        }

        return Response.json({
            message: "Message acceptance updated successfully",
            success: true,
            updatedUser: updatedUser,
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error updating message acceptance:", error);
        return Response.json({
            message: "Internal server error",
            success: false,
        }, { status: 500 });
        
    }



}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as User ;

    if (!session || !session.user) {
        return Response.json({
            message: "Unauthorized",
            success: false,
        }, { status: 401 });
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
    
        if (!foundUser) {
            return Response.json({
                message: "User not found",
                success: false,
            }, { status: 404 });
        }
    
        return Response.json({
            message: "User message acceptance status retrieved successfully",
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessages,
        }, { status: 200 });
    
    } catch (error) {
        console.error("Error retrieving message acceptance status:", error);
        return Response.json({
            message: "Internal server error",
            success: false,
        }, { status: 500 });
        
    }
}