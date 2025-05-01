# 🎥 Enhanced Video Progress Tracker with MongoDB Atlas

An advanced video learning platform that tracks **unique viewing progress**, prevents **skip-based cheating**, supports **seamless resume**, and provides **detailed analytics** — now enhanced with **MongoDB Atlas** integration for persistent, cross-session tracking.
Check Live Site: https://video-progress-tracker-t1ow.vercel.app/
--- 

![image](https://github.com/user-attachments/assets/ea009fc3-8170-48a1-adf7-d3bddb3133e8)
![image](https://github.com/user-attachments/assets/ad8797c1-573b-44d1-a423-4517d913b0d6)

![image](https://github.com/user-attachments/assets/292ac441-34f8-4aca-96c8-a56be5f8f5bd)
![image](https://github.com/user-attachments/assets/89f5644f-d283-4f89-a34d-8b3079b76230)
![image](https://github.com/user-attachments/assets/decffd6d-9fba-4bac-b07e-cf99726742e9)





## 🚀 Features

### ✅ Accurate Progress Tracking  
Tracks only **unique watched segments** — rewatching or skipping does **not** artificially increase progress.

### 🚫 Skip Prevention  
Jumping ahead in the video ends the current watch segment and starts a new one — skipped parts aren't counted.

### 🔁 Seamless Resume  
When returning, videos resume **from the last watched position**, with progress automatically restored.

### 📊 Detailed Analytics Dashboard  
Includes metrics like:
- Total watch time  
- Completion percentage  
- Segment-based progress visualization  
- Per-video breakdown

### 🎨 Visual Progress Indicators  
- Dynamic progress bar  
- Watched segments highlighted  
- % completed shown visually  

### 🌍 MongoDB Atlas Integration  
Stores all progress data (watched segments, current time, video metadata) in MongoDB Atlas:
- Scalable and persistent  
- Works across devices/sessions  
- Fallback to localStorage if offline

### 📱 Responsive Design  
Fully optimized for desktop, tablet, and mobile devices.

---

## 🧠 How It Works

### 1. Unique Viewing Interval Tracking
```ts
const calculateUniqueWatchedTime = (intervals: Interval[]): number => {
  if (!intervals.length) return 0;
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i].start <= last.end) {
      last.end = Math.max(last.end, sorted[i].end);
    } else {
      merged.push(sorted[i]);
    }
  }

  return merged.reduce((total, i) => total + (i.end - i.start), 0);
};
```

### 2. Saving to MongoDB Atlas
```ts
// API endpoint example for saving progress
POST /api/progress
{
  userId: "...",
  videoId: "...",
  watchedIntervals: [...],
  lastPosition: ...
}
```

---

## 🧪 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/video-progress-tracker.git
cd video-progress-tracker
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
npm install next react react-dom --legacy-peer-deps
```

### 3. Environment Variables

Create a `.env.local` file in the root:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### 4. Run the App
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 📊 MongoDB Collections

- **users** – stores user details  
- **videos** – stores video metadata  
- **progress** – stores unique watched intervals and playback time per user per video  

---

## 🔍 Analytics Page

Visit `/analytics/mongodb` to see:
- Total unique watch time  
- Per-video statistics  
- Visual breakdown of watched intervals

---

## 🐛 Troubleshooting

- **Video shows `00:00 / 00:00`**?  
  Ensure video element has:  
  ```html
  <video preload="metadata" ... />
  ```
  And use `onLoadedMetadata` to fetch duration.

- **MongoDB connection fails**?  
  - Check `.env.local`  
  - Whitelist your IP in MongoDB Atlas  
  - Restart your dev server

---

## 📦 Technologies Used

- React + Next.js  
- TypeScript  
- MongoDB Atlas (via Mongoose)  
- Tailwind CSS  
- RESTful APIs  
- LocalStorage (fallback)

---

## 📬 Contact

For suggestions, issues, or contributions, feel free to open a PR or contact [chandupichika0@gmail.com].
