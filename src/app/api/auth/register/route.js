import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "../../../lib/db";
import { createToken, cookieOptions } from "../../../lib/auth";

export async function POST(request) {
    try {
        const { name, email, password, role = "student" } = await request.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
        }

        // Get database connection
        const db = await getDb();

        // Check if email already exists
        const existingUser = await db.collection("users").findOne({
            email: email.toLowerCase(),
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user - no verification needed
        const newUser = {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            createdAt: new Date(),
            isVerified: true, // User is automatically verified
        };

        // Insert user into database
        const result = await db.collection("users").insertOne(newUser);

        // Get the created user
        const user = await db
            .collection("users")
            .findOne({ _id: result.insertedId });

        // Create and set authentication cookie
        const token = await createToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Return user data (excluding password)
        const { password: _, ...userData } = user;

        // Prepare response and attach cookie
        const response = NextResponse.json({ message: "Registration successful", user: userData }, { status: 201 });
        response.cookies.set("authToken", token, cookieOptions);
        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 });
    }
}