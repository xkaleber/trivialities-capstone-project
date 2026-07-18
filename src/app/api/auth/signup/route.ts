import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword } from "@/helpers/auth";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { username, email, password } = await request.json();

    // 1. Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already registered" },
        { status: 400 },
      );
    }

    // 3. Hash the password safely using helper
    const passwordHash = await hashPassword(password);

    // 4. Create and save the new user
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully! 🎉" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
