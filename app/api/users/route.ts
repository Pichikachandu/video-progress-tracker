import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { User } from "@/lib/models"

// Get user by ID or email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const email = searchParams.get("email")

    if (!userId && !email) {
      return NextResponse.json({ error: "User ID or email is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("video_progress")
    const usersCollection = db.collection("users")

    const query: any = {}
    if (userId) {
      query._id = userId
    } else if (email) {
      query.email = email
    }

    const user = await usersCollection.findOne(query)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("video_progress")
    const usersCollection = db.collection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const newUser: User = {
      email,
      name,
      createdAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)
    return NextResponse.json({ success: true, result, user: newUser })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
