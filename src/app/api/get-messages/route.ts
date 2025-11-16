import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../../lib/options";

export async function GET() {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as User ;

    if (!session || !session.user) {
        return Response.json({
            message: "Unauthorized",
            success: false,
        }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            {$unwind: "$messages"},
            { $sort: { "messages.createdAt": -1 } },
            {$group: {_id: "$_id", messages: { $push: "$messages" }}},
        ])
        if (!user || user.length === 0) {
            return Response.json({
                message: "User not found",
                success: false,
            }, { status: 401 });
        }

        return Response.json({
            message: "Messages fetched successfully",
            success: true,
            messages: user[0].messages,
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching messages:", error);
        return Response.json({
            message: "Internal server error",
            success: false,
        }, { status: 500 });
        
    }
}