// app/api/accept-messages/route.ts
import dbConnect from "@/lib/dbConnect";
import { authOptions } from "@/lib/options";
import UserModel from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  const userId = session.user._id;
  const { acceptMessages } = await request.json(); // fixed typo

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Message acceptance updated successfully",
        success: true,
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating message acceptance:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  const userId = session.user._id;

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "User message acceptance status retrieved successfully",
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving message acceptance status:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
