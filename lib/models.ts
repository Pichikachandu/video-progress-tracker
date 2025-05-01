export interface User {
  _id?: string
  email: string
  name: string
  createdAt: Date
}

export interface Interval {
  start: number
  end: number
}

export interface VideoProgress {
  _id?: string
  userId: string
  videoId: string
  title: string
  intervals: Interval[]
  lastPosition: number
  duration: number
  updatedAt: Date
}

export interface Video {
  _id?: string
  videoId: string
  title: string
  description: string
  duration: number
  src: string
  createdAt: Date
}
