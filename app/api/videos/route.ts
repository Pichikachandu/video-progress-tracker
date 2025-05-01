import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Video } from "@/lib/models"

// Get all videos or a specific video
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("videoId")

    const client = await clientPromise
    const db = client.db("video_progress")
    const videosCollection = db.collection("videos")

    if (videoId) {
      const video = await videosCollection.findOne({ videoId })
      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 })
      }
      return NextResponse.json(video)
    } else {
      const videos = await videosCollection.find({}).toArray()
      return NextResponse.json(videos)
    }
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

// Add a new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoId, title, description, duration, src } = body

    if (!videoId || !title || !src) {
      return NextResponse.json({ error: "Video ID, title, and source URL are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("video_progress")
    const videosCollection = db.collection("videos")

    // Check if video already exists
    const existingVideo = await videosCollection.findOne({ videoId })
    if (existingVideo) {
      return NextResponse.json({ error: "Video already exists" }, { status: 409 })
    }

    const newVideo: Video = {
      videoId,
      title,
      description: description || "",
      duration,
      src,
      createdAt: new Date(),
    }

    const result = await videosCollection.insertOne(newVideo)
    return NextResponse.json({ success: true, result, video: newVideo })
  } catch (error) {
    console.error("Error adding video:", error)
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 })
  }
}
