import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { usernameValidation } from "@/schemas/signupSchema";
import { z } from "zod";




const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
        username: searchParams.get("username")
    }
    // Validate query parameters with Zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    if (!result.success) {
      return Response.json({
        message: "Invalid query parameters",
        success: false,
        errors: result.error.issues,
      }, { status: 400 });
    }

    const { username } = result.data;

    const existingVerifiedUser = UserModel.findOne({ username, isVerified: true})

    if (!existingVerifiedUser) {
      return Response.json({
        message: "Username is already taken",
        success: false,
      }, { status: 400 });
    }
    return Response.json({
      message: "Username is available",
      success: true,
    }, { status: 200 });
    
  } catch (error) {
       console.error("Error checking username uniqueness:", error);
       return Response.json({
            message: "Internal server error",
            success: false,
       }, { status: 500 });
    }
}

