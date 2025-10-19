import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);

    // 1. Check if user exists
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // 2. Validate code and expiry
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired =
      user.verifyCodeExpiry && user.verifyCodeExpiry > new Date();

    // 3. Correct condition — both must be true
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        { message: "Account verified successfully!", success: true },
        { status: 200 }
      );
    }

    // 4. Handle expiry
    if (!isCodeNotExpired) {
      return Response.json(
        { message: "Verification code has expired.", success: false },
        { status: 400 }
      );
    }

    // 5. Handle incorrect code
    return Response.json(
      { message: "Incorrect verification code.", success: false },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error verifying user:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
