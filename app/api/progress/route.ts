import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { VideoProgress } from "@/lib/models"
import { ObjectId, OptionalId } from "mongodb"

// Get all progress for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const videoId = searchParams.get("videoId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("video_progress")
    const progressCollection = db.collection<VideoProgress>("progress")

    const query: any = { userId }
    if (videoId) {
      query.videoId = videoId
    }

    const progress = await progressCollection.find(query).toArray()
    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}

// Save or update progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, videoId, title, intervals, lastPosition, duration } = body

    if (!userId || !videoId) {
      return NextResponse.json({ error: "User ID and Video ID are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("video_progress")
    const progressCollection = db.collection<VideoProgress>("progress")

    const existingProgress = await progressCollection.findOne({ userId, videoId })

    const updatedProgress: Omit<VideoProgress, "_id"> = {
      userId,
      videoId,
      title,
      intervals,
      lastPosition,
      duration,
      updatedAt: new Date(),
    }

    let result

    if (existingProgress) {
      result = await progressCollection.updateOne({ userId, videoId }, { $set: updatedProgress })
    } else {
      result = await progressCollection.insertOne(updatedProgress) // ✅ FIXED: no cast needed
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error saving progress:", error)
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
  }
}
