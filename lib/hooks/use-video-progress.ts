"use client"

import { useState, useEffect } from "react"
import type { Interval } from "@/lib/models"

// Mock user ID for demo purposes - in a real app, this would come from authentication
const MOCK_USER_ID = "user123"

export function useVideoProgress(videoId: string, title: string) {
  const [watchedIntervals, setWatchedIntervals] = useState<Interval[]>([])
  const [lastPosition, setLastPosition] = useState(0)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load progress from MongoDB
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/progress?userId=${MOCK_USER_ID}&videoId=${videoId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch progress")
        }

        const data = await response.json()

        if (data && data.length > 0) {
          const videoProgress = data[0]
          setWatchedIntervals(videoProgress.intervals || [])
          setLastPosition(videoProgress.lastPosition || 0)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error loading progress:", err)
        setError("Failed to load progress data")
        setIsLoading(false)

        // Fallback to localStorage if API fails
        fallbackToLocalStorage()
      }
    }

    const fallbackToLocalStorage = () => {
      const savedData = localStorage.getItem(`video-progress-${title}`)
      if (savedData) {
        const { intervals, lastPosition } = JSON.parse(savedData)
        setWatchedIntervals(intervals || [])
        setLastPosition(lastPosition || 0)
      }
    }

    loadProgress()
  }, [videoId, title])

  // Save progress to MongoDB
  const saveProgress = async (intervals: Interval[], position: number, duration: number) => {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          videoId,
          title,
          intervals,
          lastPosition: position,
          duration,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save progress")
      }

      // Fallback: also save to localStorage
      const data = {
        intervals,
        lastPosition: position,
      }
      localStorage.setItem(`video-progress-${title}`, JSON.stringify(data))

      return true
    } catch (err) {
      console.error("Error saving progress:", err)

      // Fallback: save to localStorage if API fails
      const data = {
        intervals,
        lastPosition: position,
      }
      localStorage.setItem(`video-progress-${title}`, JSON.stringify(data))

      return false
    }
  }

  // Calculate unique watched time by merging intervals
  const calculateUniqueWatchedTime = (intervals: Interval[], duration: number): number => {
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
    const uniqueTime = mergedIntervals.reduce((total, interval) => {
      return total + (interval.end - interval.start)
    }, 0)

    // Update progress percentage
    if (duration > 0) {
      setProgressPercentage((uniqueTime / duration) * 100)
    }

    return uniqueTime
  }

  return {
    watchedIntervals,
    setWatchedIntervals,
    lastPosition,
    progressPercentage,
    isLoading,
    error,
    saveProgress,
    calculateUniqueWatchedTime,
  }
}
