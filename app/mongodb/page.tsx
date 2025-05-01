"use client"

import { useEffect, useState } from "react"
import VideoPlayerMongoDB from "@/components/video-player-mongodb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Database } from "lucide-react"
import Link from "next/link"

interface Video {
  _id?: string
  videoId: string
  title: string
  description: string
  duration: number
  src: string
}

export default function MongoDBPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  // Load videos from API
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setIsLoading(true)

        // First, check if we have any videos in the database
        const response = await fetch("/api/videos")

        if (!response.ok) {
          throw new Error("Failed to fetch videos")
        }

        let data = await response.json()

        // If no videos exist, create sample videos
        if (data.length === 0) {
          console.log("No videos found, creating sample videos")

          const sampleVideos = [
            {
              videoId: "video1",
              title: "Introduction to React Hooks",
              description: "Learn the fundamentals of React Hooks and how they can simplify your code.",
              duration: 596, // 9:56 in seconds
              src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            },
            {
              videoId: "video2",
              title: "Advanced JavaScript Concepts",
              description: "Deep dive into advanced JavaScript concepts and patterns.",
              duration: 720, // 12:00 in seconds
              src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            },
            {
              videoId: "video3",
              title: "CSS Grid Layout",
              description: "Master CSS Grid Layout for modern web design.",
              duration: 540, // 9:00 in seconds
              src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            },
          ]

          // Add sample videos to database
          for (const video of sampleVideos) {
            await fetch("/api/videos", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(video),
            })
          }

          // Fetch videos again
          const newResponse = await fetch("/api/videos")
          if (!newResponse.ok) {
            throw new Error("Failed to fetch videos after creation")
          }
          data = await newResponse.json()
        }

        setVideos(data)

        // Select the first video by default
        if (data.length > 0) {
          setSelectedVideo(data[0])
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error loading videos:", err)
        setError("Failed to load videos. Please try again later.")
        setIsLoading(false)
      }
    }

    loadVideos()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">MongoDB Integration</h1>
          <Database className="text-primary w-6 h-6" />
        </div>
        <p className="text-gray-600">Video progress is now stored in MongoDB Atlas</p>
      </div>

      {selectedVideo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <VideoPlayerMongoDB src={selectedVideo.src} title={selectedVideo.title} videoId={selectedVideo.videoId} />

            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">{selectedVideo.title}</h2>
              <p className="text-gray-700">{selectedVideo.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  Duration: {Math.floor(selectedVideo.duration / 60)}:
                  {(selectedVideo.duration % 60).toString().padStart(2, "0")} minutes
                </p>
                <p>Instructor: John Doe</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Available Lectures</CardTitle>
                <CardDescription>Select a video to watch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div
                      key={video.videoId}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedVideo?.videoId === video.videoId
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")} minutes
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>MongoDB Integration</CardTitle>
                <CardDescription>How it works</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p>
                  This version of the video player stores all progress data in MongoDB Atlas instead of localStorage.
                </p>
                <p>The system tracks unique viewing intervals and merges them to calculate accurate progress.</p>
                <p>Benefits include:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Persistent storage across devices</li>
                  <li>Server-side progress calculation</li>
                  <li>Scalable for multiple users</li>
                  <li>Analytics capabilities</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
