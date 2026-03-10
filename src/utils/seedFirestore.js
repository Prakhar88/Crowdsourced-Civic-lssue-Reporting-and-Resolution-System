// src/utils/seedFirestore.js
// Run once from browser console or a temporary button to populate Firestore
// Usage:  import { seedReports } from "../utils/seedFirestore";
//         await seedReports();

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

// ---------------------------------------------------------------------------
// Delhi/NCR base coordinates with jitter
// ---------------------------------------------------------------------------
const DELHI_LOCATIONS = [
  { lat: 28.6139, lng: 77.2090, address: "Connaught Place, New Delhi" },
  { lat: 28.6562, lng: 77.2410, address: "Civil Lines, Delhi" },
  { lat: 28.5355, lng: 77.3910, address: "Sector 18, Noida" },
  { lat: 28.4595, lng: 77.0266, address: "Gurugram Sector 29" },
  { lat: 28.7041, lng: 77.1025, address: "Rohini, Delhi" },
  { lat: 28.6315, lng: 77.2167, address: "Karol Bagh, Delhi" },
  { lat: 28.5672, lng: 77.2100, address: "Hauz Khas, Delhi" },
  { lat: 28.6280, lng: 77.3649, address: "Indirapuram, Ghaziabad" },
  { lat: 28.5921, lng: 77.0460, address: "Dwarka Sector 21, Delhi" },
  { lat: 28.6880, lng: 77.2217, address: "Model Town, Delhi" },
];

const CATEGORIES = ["pothole", "garbage", "streetlight", "flooding", "vandalism"];
const STATUSES = ["pending", "assigned", "in_progress", "resolved"];
const PRIORITIES = ["low", "medium", "high", "critical"];

const TITLES = {
  pothole:     ["Deep pothole on main road", "Crater-sized pothole near market", "Road cave-in near school", "Multiple potholes after rain"],
  garbage:     ["Garbage dump overflowing", "Waste not collected for days", "Illegal dumping near park", "Overflowing community dustbin"],
  streetlight: ["Street light broken", "Entire lane lights out", "Flickering lamp post", "No lights in parking area"],
  flooding:    ["Waterlogging after rain", "Drain overflow blocking road", "Flooded underpass", "Stagnant water breeding mosquitoes"],
  vandalism:   ["Graffiti on public building", "Broken park bench", "Damaged bus stop shelter", "Stolen manhole cover"],
};

const DESCRIPTIONS = {
  pothole:     "Large pothole causing danger to two-wheelers and pedestrians. Needs urgent patching.",
  garbage:     "Garbage has not been collected and is spilling onto the road. Stray animals are spreading waste.",
  streetlight: "Street light has been non-functional creating a safety hazard at night.",
  flooding:    "Heavy waterlogging is making the road impassable for vehicles and pedestrians.",
  vandalism:   "Public property has been damaged/defaced. Requires repair and cleanup.",
};

// ---------------------------------------------------------------------------
// Helper: random past timestamp within the last 14 days
// ---------------------------------------------------------------------------
function randomPastTimestamp(maxDaysAgo = 14) {
  const now = Date.now();
  const offset = Math.floor(Math.random() * maxDaysAgo * 24 * 60 * 60 * 1000);
  return Timestamp.fromDate(new Date(now - offset));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitter(val, range = 0.01) {
  return val + (Math.random() - 0.5) * 2 * range;
}

// ---------------------------------------------------------------------------
// Seed 20 reports
// ---------------------------------------------------------------------------
export async function seedReports() {
  const reportsRef = collection(db, "reports");
  const results = [];

  for (let i = 0; i < 20; i++) {
    const category = CATEGORIES[i % CATEGORIES.length]; // even distribution
    const loc = pick(DELHI_LOCATIONS);
    const status = STATUSES[i % STATUSES.length]; // even distribution
    const priority = pick(PRIORITIES);
    const titles = TITLES[category];
    const title = titles[i % titles.length];
    const createdAt = randomPastTimestamp();

    const reportData = {
      title,
      description: DESCRIPTIONS[category],
      category,
      status,
      priority,
      aiPriority: priority,
      aiConfidence: +(0.6 + Math.random() * 0.35).toFixed(2), // 0.60–0.95
      location: {
        lat: jitter(loc.lat),
        lng: jitter(loc.lng),
        address: loc.address,
      },
      reportedBy: `user_${String(i + 1).padStart(3, "0")}`,
      upvotes: Math.floor(Math.random() * 50),
      images: [],
      createdAt,
      updatedAt: createdAt,
    };

    const docRef = await addDoc(reportsRef, reportData);
    results.push({ id: docRef.id, title });
  }

  console.log(`✅ Seeded ${results.length} reports:`, results);
  return results;
}
