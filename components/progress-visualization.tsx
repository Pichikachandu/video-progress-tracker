"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface Interval {
  start: number
  end: number
}

interface ProgressVisualizationProps {
  title: string
  duration: number
}

export default function ProgressVisualization({ title, duration }: ProgressVisualizationProps) {
  const [watchedIntervals, setWatchedIntervals] = useState<Interval[]>([])
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [mergedIntervals, setMergedIntervals] = useState<Interval[]>([])

  useEffect(() => {
    // Load saved progress from localStorage
    const savedData = localStorage.getItem(`video-progress-${title}`)
    if (savedData) {
      const { intervals } = JSON.parse(savedData)
      setWatchedIntervals(intervals)

      // Calculate merged intervals and progress
      const merged = mergeIntervals(intervals)
      setMergedIntervals(merged)

      const uniqueWatchedTime = calculateUniqueWatchedTime(merged)
      setProgressPercentage((uniqueWatchedTime / duration) * 100)
    }
  }, [title, duration])

  // Merge overlapping intervals
  const mergeIntervals = (intervals: Interval[]): Interval[] => {
    if (intervals.length === 0) return []

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

    return mergedIntervals
  }

  // Calculate unique watched time
  const calculateUniqueWatchedTime = (intervals: Interval[]): number => {
    return intervals.reduce((total, interval) => {
      return total + (interval.end - interval.start)
    }, 0)
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Your Learning Progress</h3>

      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <Progress value={progressPercentage} className="h-4" />

          {/* Visualization of watched segments */}
          {mergedIntervals.map((interval, index) => {
            const startPercent = (interval.start / duration) * 100
            const widthPercent = ((interval.end - interval.start) / duration) * 100

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
      </div>

      <div className="text-sm text-gray-600">
        <p>
          You've watched {Math.round(calculateUniqueWatchedTime(mergedIntervals))} seconds out of {Math.round(duration)}{" "}
          seconds total.
        </p>
        <p className="mt-2 text-xs text-gray-500">Note: Only unique parts of the video count toward your progress.</p>
      </div>
    </div>
  )
}
