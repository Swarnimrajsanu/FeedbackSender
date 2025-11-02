import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../../../lib/options";

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
    const messageId = params.messageId;
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as User ;

    if (!session || !session.user) {
        return Response.json({
            message: "Unauthorized",
            success: false,
        }, { status: 401 });
    }
    try {
        const updateResult = await UserModel.updateOne(
            {_id: user._id},
            { $pull: { messages: { _id: messageId } } }
        )
        if (updateResult.modifiedCount === 0) {
            return Response.json({
                message: "Message not found or could not be deleted",
                success: false,
            }, { status: 404 });
        }

        return Response.json({
            message: "Message deleted successfully",
            success: true,
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error deleting message:", error);
        return Response.json({
            message: "Internal server error",
            success: false,
        }, { status: 500 });
        
    }

    
}