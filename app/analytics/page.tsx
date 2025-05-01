"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Eye, BarChart } from "lucide-react"
import Link from "next/link"

interface Interval {
  start: number
  end: number
}

interface VideoProgress {
  title: string
  intervals: Interval[]
  lastPosition: number
  duration: number
}

export default function AnalyticsPage() {
  const [videoProgress, setVideoProgress] = useState<Record<string, VideoProgress>>({})
  const [totalWatchTime, setTotalWatchTime] = useState(0)
  const [averageCompletion, setAverageCompletion] = useState(0)

  useEffect(() => {
    // Get all video progress from localStorage
    const allProgress: Record<string, VideoProgress> = {}
    let totalTime = 0
    let totalPercentage = 0
    let videoCount = 0

    // Sample video data for demonstration
    const sampleVideos = [
      {
        key: "video-progress-Introduction to React Hooks",
        title: "Introduction to React Hooks",
        duration: 596, // 9:56 in seconds
      },
      {
        key: "video-progress-Advanced JavaScript Concepts",
        title: "Advanced JavaScript Concepts",
        duration: 720, // 12:00 in seconds
      },
      {
        key: "video-progress-CSS Grid Layout",
        title: "CSS Grid Layout",
        duration: 540, // 9:00 in seconds
      },
    ]

    sampleVideos.forEach((video) => {
      const savedData = localStorage.getItem(video.key)

      if (savedData) {
        const { intervals, lastPosition } = JSON.parse(savedData)

        // Calculate unique watched time
        const uniqueWatchedTime = calculateUniqueWatchedTime(intervals)
        const progressPercentage = (uniqueWatchedTime / video.duration) * 100

        allProgress[video.title] = {
          title: video.title,
          intervals,
          lastPosition,
          duration: video.duration,
        }

        totalTime += uniqueWatchedTime
        totalPercentage += progressPercentage
        videoCount++
      } else {
        // Add empty progress for demonstration
        allProgress[video.title] = {
          title: video.title,
          intervals: [],
          lastPosition: 0,
          duration: video.duration,
        }
      }
    })

    setVideoProgress(allProgress)
    setTotalWatchTime(totalTime)
    setAverageCompletion(videoCount > 0 ? totalPercentage / videoCount : 0)
  }, [])

  // Calculate unique watched time by merging intervals
  const calculateUniqueWatchedTime = (intervals: Interval[]): number => {
    if (intervals.length === 0) return 0

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Video Player
        </Link>
        <h1 className="text-3xl font-bold">Learning Analytics</h1>
        <p className="text-gray-600 mt-2">Track your progress across all lectures</p>
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
            <p className="text-3xl font-bold">{Object.keys(videoProgress).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Lecture Progress</h2>

        <div className="space-y-6">
          {Object.values(videoProgress).map((video) => {
            const uniqueWatchedTime = calculateUniqueWatchedTime(video.intervals)
            const progressPercentage = (uniqueWatchedTime / video.duration) * 100

            return (
              <div key={video.title} className="border-b pb-4 last:border-0 last:pb-0">
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
                  {video.intervals.map((interval, index) => {
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
                  <Link href="/" className="text-sm text-primary hover:underline">
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
