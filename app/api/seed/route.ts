import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Video, User } from "@/lib/models"

// Seed the database with sample data
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("video_progress")

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes("users")) {
      await db.createCollection("users")
    }

    if (!collectionNames.includes("videos")) {
      await db.createCollection("videos")
    }

    if (!collectionNames.includes("progress")) {
      await db.createCollection("progress")
    }

    // Add sample user
    const usersCollection = db.collection("users")
    const existingUser = await usersCollection.findOne({ email: "user@example.com" })

    if (!existingUser) {
      const sampleUser: User = {
        email: "user@example.com",
        name: "Demo User",
        createdAt: new Date(),
      }
      await usersCollection.insertOne(sampleUser)
    }

    // Add sample videos
    const videosCollection = db.collection("videos")
    const existingVideos = await videosCollection.countDocuments()

    if (existingVideos === 0) {
      const sampleVideos: Video[] = [
        {
          videoId: "video1",
          title: "Introduction to React Hooks",
          description: "Learn the fundamentals of React Hooks and how they can simplify your code.",
          duration: 596, // 9:56 in seconds
          src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          createdAt: new Date(),
        },
        {
          videoId: "video2",
          title: "Advanced JavaScript Concepts",
          description: "Deep dive into advanced JavaScript concepts and patterns.",
          duration: 720, // 12:00 in seconds
          src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          createdAt: new Date(),
        },
        {
          videoId: "video3",
          title: "CSS Grid Layout",
          description: "Master CSS Grid Layout for modern web design.",
          duration: 540, // 9:00 in seconds
          src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
          createdAt: new Date(),
        },
      ]

      await videosCollection.insertMany(sampleVideos)
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      {
        error: "Failed to seed database",
      },
      { status: 500 },
    )
  }
}
