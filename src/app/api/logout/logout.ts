import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Remove the auth cookie
    const response = NextResponse.json(
      { message: "Logout successful", success: true },
      { status: 200 }
    );

    // Clear the JWT or session cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0), // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Error logging out", success: false },
      { status: 500 }
    );
  }
}

