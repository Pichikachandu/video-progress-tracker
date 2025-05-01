"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Eye, BarChart } from "lucide-react"
import Link from "next/link"
import type { Interval } from "@/lib/models"

interface VideoProgress {
  _id?: string
  userId: string
  videoId: string
  title: string
  intervals: Interval[]
  lastPosition: number
  duration: number
  updatedAt: Date
}

interface Video {
  _id?: string
  videoId: string
  title: string
  description: string
  duration: number
  src: string
}

// Mock user ID for demo purposes
const MOCK_USER_ID = "user123"

export default function MongoDBAnalyticsPage() {
  const [videoProgress, setVideoProgress] = useState<VideoProgress[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [totalWatchTime, setTotalWatchTime] = useState(0)
  const [averageCompletion, setAverageCompletion] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Fetch videos
        const videosResponse = await fetch("/api/videos")
        if (!videosResponse.ok) {
          throw new Error("Failed to fetch videos")
        }
        const videosData = await videosResponse.json()
        setVideos(videosData)

        // Fetch progress for the user
        const progressResponse = await fetch(`/api/progress?userId=${MOCK_USER_ID}`)
        if (!progressResponse.ok) {
          throw new Error("Failed to fetch progress")
        }
        const progressData = await progressResponse.json()
        setVideoProgress(progressData)

        // Calculate total watch time and average completion
        let totalTime = 0
        let totalPercentage = 0
        let videoCount = 0

        for (const progress of progressData) {
          const uniqueWatchedTime = calculateUniqueWatchedTime(progress.intervals)
          const progressPercentage = (uniqueWatchedTime / progress.duration) * 100

          totalTime += uniqueWatchedTime
          totalPercentage += progressPercentage
          videoCount++
        }

        setTotalWatchTime(totalTime)
        setAverageCompletion(videoCount > 0 ? totalPercentage / videoCount : 0)

        setIsLoading(false)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load analytics data. Please try again later.")
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate unique watched time by merging intervals
  const calculateUniqueWatchedTime = (intervals: Interval[]): number => {
    if (!intervals || intervals.length === 0) return 0

    // Sort intervals by start time
    const sortedIntervals = [...intervals].sort((a, b) => a.start - b.start)

    // Merge overlapping intervals
    const mergedIntervals: Interval[] = []
    let currentMergedInterval = { ...sortedIntervals[0] }

    for (let i = 1; i < sortedIntervals.length; i++) {
      const interval = sortedIntervals[i]

      // If current interval overlaps with merged interval, extend the merged interval
      if (interval.start <= currentMergedInterval.end) {
        currentMergedInterval.end = Math.max(currentMergedInterval.end, interval.end)
      } else {
        // No overlap, add the merged interval to result and start a new one
        mergedIntervals.push(currentMergedInterval)
        currentMergedInterval = { ...interval }
      }
    }

    // Add the last merged interval
    mergedIntervals.push(currentMergedInterval)

    // Calculate total unique time
    return mergedIntervals.reduce((total, interval) => {
      return total + (interval.end - interval.start)
    }, 0)
  }

  // Format time (seconds to HH:MM:SS)
  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = Math.floor(timeInSeconds % 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics data...</p>
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
        <Link href="/mongodb" className="flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Video Player
        </Link>
        <h1 className="text-3xl font-bold">MongoDB Analytics</h1>
        <p className="text-gray-600 mt-2">Track your progress across all lectures with MongoDB</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Total Watch Time
            </CardTitle>
            <CardDescription>Unique content watched</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatTime(totalWatchTime)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Eye className="w-5 h-5 mr-2 text-primary" />
              Average Completion
            </CardTitle>
            <CardDescription>Across all lectures</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round(averageCompletion)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-primary" />
              Lectures Started
            </CardTitle>
            <CardDescription>Out of total lectures</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {videoProgress.length} / {videos.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Lecture Progress (MongoDB)</h2>

        <div className="space-y-6">
          {videos.map((video) => {
            const progress = videoProgress.find((p) => p.videoId === video.videoId)
            const uniqueWatchedTime = progress ? calculateUniqueWatchedTime(progress.intervals) : 0
            const progressPercentage = progress ? (uniqueWatchedTime / video.duration) * 100 : 0

            return (
              <div key={video.videoId} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{video.title}</h3>
                    <p className="text-sm text-gray-600">
                      {formatTime(uniqueWatchedTime)} of {formatTime(video.duration)} watched
                    </p>
                  </div>
                  <span className="text-lg font-semibold">{Math.round(progressPercentage)}%</span>
                </div>

                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <Progress value={progressPercentage} className="h-2" />

                  {/* Visualization of watched segments */}
                  {progress &&
                    progress.intervals &&
                    progress.intervals.map((interval, index) => {
                      const startPercent = (interval.start / video.duration) * 100
                      const widthPercent = ((interval.end - interval.start) / video.duration) * 100

                      return (
                        <div
                          key={index}
                          className="absolute h-full bg-green-500"
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`,
                            opacity: 0.7,
                          }}
                        />
                      )
                    })}
                </div>

                <div className="mt-2">
                  <Link href="/mongodb" className="text-sm text-primary hover:underline">
                    Continue watching
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
