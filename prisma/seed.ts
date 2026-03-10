import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const EXERCISES = [
  // Chest
  { name: "Barbell Bench Press", muscleGroups: ["CHEST"], equipment: ["BARBELL"], difficulty: "INTERMEDIATE", movementPattern: "PUSH", primaryMuscle: "CHEST", description: "The king of chest exercises. A compound horizontal push movement using a barbell.", instructions: ["Lie flat on a bench with your feet on the floor", "Grip the bar slightly wider than shoulder width", "Unrack the bar and hold it directly above your chest", "Lower the bar to your lower chest with control", "Press the bar back up to the starting position"], commonMistakes: ["Flaring elbows too wide", "Bouncing the bar off the chest", "Not retracting the shoulder blades", "Uneven bar path"], tips: ["Squeeze the bar hard and push the floor away", "Maintain a slight arch in your lower back", "Keep your wrists neutral"], repRangeStrength: "3-5", repRangeHypertrophy: "8-12", repRangeEndurance: "15-20" },
  { name: "Dumbbell Bench Press", muscleGroups: ["CHEST"], equipment: ["DUMBBELL"], difficulty: "BEGINNER", movementPattern: "PUSH", primaryMuscle: "CHEST", description: "A chest press variation using dumbbells for greater range of motion.", instructions: ["Sit on a bench with dumbbells on your thighs", "Lie back and position dumbbells at chest level", "Press both dumbbells up until arms are fully extended", "Lower slowly with control", "Bring dumbbells back to start position"], commonMistakes: ["Letting wrists bend back", "Moving dumbbells at different speeds"], tips: ["Touch the dumbbells at the top for peak contraction", "Control the descent: 2-3 seconds down"], repRangeStrength: "4-6", repRangeHypertrophy: "8-12", repRangeEndurance: "12-15" },
  { name: "Incline Barbell Press", muscleGroups: ["CHEST", "SHOULDERS"], equipment: ["BARBELL"], difficulty: "INTERMEDIATE", movementPattern: "PUSH", primaryMuscle: "CHEST", description: "Targets the upper chest with an inclined pressing angle.", instructions: ["Set bench to 30-45 degrees", "Grip bar slightly wider than shoulders", "Lower bar to upper chest", "Press back to starting position"], commonMistakes: ["Setting incline too steep", "Losing shoulder blade retraction"], tips: ["Keep elbows at 45-70 degrees from torso"], repRangeStrength: "3-5", repRangeHypertrophy: "8-10", repRangeEndurance: "12-15" },
  { name: "Cable Crossover", muscleGroups: ["CHEST"], equipment: ["CABLE"], difficulty: "INTERMEDIATE", movementPattern: "PUSH", primaryMuscle: "CHEST", description: "Isolation exercise for the chest using cables for constant tension.", instructions: ["Set pulleys to shoulder height", "Stand in center, one foot forward", "Pull cables together in a hugging motion", "Squeeze chest at center", "Slowly return to start"], commonMistakes: ["Using momentum", "Not squeezing at the top"], tips: ["Slight forward lean increases chest activation"], repRangeStrength: "N/A", repRangeHypertrophy: "12-15", repRangeEndurance: "15-20" },
  { name: "Push-Up", muscleGroups: ["CHEST", "TRICEPS"], equipment: ["BODYWEIGHT"], difficulty: "BEGINNER", movementPattern: "PUSH", primaryMuscle: "CHEST", description: "The foundational bodyweight chest exercise.", instructions: ["Start in high plank with hands shoulder-width apart", "Lower chest to the floor", "Push back up to start"], commonMistakes: ["Sagging hips", "Flaring elbows"], tips: ["Keep core braced throughout"], repRangeStrength: "5-10", repRangeHypertrophy: "15-25", repRangeEndurance: "25-50" },
  { name: "Dips", muscleGroups: ["CHEST", "TRICEPS"], equipment: ["BODYWEIGHT"], difficulty: "INTERMEDIATE", movementPattern: "PUSH", primaryMuscle: "CHEST", description: "Compound movement targeting chest and triceps.", instructions: ["Grip dip bars and suspend yourself", "Lean slightly forward for chest emphasis", "Lower until arms are at 90 degrees", "Push back to start"], commonMistakes: ["Not leaning forward for chest focus", "Locking out elbows completely"], tips: ["The more you lean forward the more chest involvement"], repRangeStrength: "5-8", repRangeHypertrophy: "10-15", repRangeEndurance: "15-20" },
  // Back
  { name: "Deadlift", muscleGroups: ["BACK", "GLUTES", "HAMSTRINGS"], equipment: ["BARBELL"], difficulty: "INTERMEDIATE", movementPattern: "HINGE", primaryMuscle: "BACK", description: "The ultimate full-body compound lift. Builds overall strength and posterior chain mass.", instructions: ["Stand with feet hip-width apart, bar over mid-foot", "Hinge at hips and grip bar just outside legs", "Create tension by pushing floor away", "Keep bar close to body as you stand", "Lock out at the top, then reverse the motion"], commonMistakes: ["Bar drifting away from body", "Rounding lower back", "Not bracing the core"], tips: ["Push the floor away, don't pull the bar up", "Take a big breath before each rep"], repRangeStrength: "1-5", repRangeHypertrophy: "5-8", repRangeEndurance: "N/A" },
  { name: "Barbell Row", muscleGroups: ["BACK", "BICEPS"], equipment: ["BARBELL"], difficulty: "INTERMEDIATE", movementPattern: "PULL", primaryMuscle: "BACK", description: "Compound horizontal pulling movement for back thickness.", instructions: ["Hip hinge until torso is roughly parallel to floor", "Grip bar at shoulder width", "Pull bar to lower chest/upper abs", "Keep elbows close to body", "Lower bar with control"], commonMistakes: ["Using momentum to heave the weight", "Rounding the lower back"], tips: ["Drive elbows back, not up"], repRangeStrength: "4-6", repRangeHypertrophy: "8-12", repRangeEndurance: "12-15" },
  { name: "Pull-Up", muscleGroups: ["BACK", "BICEPS"], equipment: ["BODYWEIGHT"], difficulty: "INTERMEDIATE", movementPattern: "PULL", primaryMuscle: "BACK", description: "The foundational vertical pull exercise for lat width.", instructions: ["Hang from bar with overhand grip wider than shoulders", "Pull yourself up until chin clears the bar", "Lower with control to a dead hang"], commonMistakes: ["Kipping excessively", "Not using full range of motion"], tips: ["Think about pulling elbows to hips"], repRangeStrength: "4-6", repRangeHypertrophy: "6-12", repRangeEndurance: "12-20" },
  { name: "Lat Pulldown", muscleGroups: ["BACK", "BICEPS"], equipment: ["CABLE", "MACHINE"], difficulty: "BEGINNER", movementPattern: "PULL", primaryMuscle: "BACK", description: "Machine/cable variation of the pull-up for lat development.", instructions: ["Sit at cable machine with thighs secured", "Grip bar wide with overhand grip", "Pull bar to upper chest", "Squeeze lats at bottom", "Return to start slowly"], commonMistakes: ["Pulling too far behind neck", "Leaning back excessively"], tips: ["Think about bringing elbows to hips"], repRangeStrength: "5-8", repRangeHypertrophy: "10-12", repRangeEndurance: "12-15" },
  { name: "Romanian Deadlift", muscleGroups: ["HAMSTRINGS", "GLUTES", "BACK"], equipment: ["BARBELL", "DUMBBELL"], difficulty: "INTERMEDIATE", movementPattern: "HINGE", primaryMuscle: "HAMSTRINGS", description: "Hip hinge movement focusing on hamstrings and glutes.", instructions: ["Hold bar at hip height with straight arms", "Push hips back while keeping back straight", "Lower bar along legs until you feel hamstring stretch", "Drive hips forward to return"], commonMistakes: ["Bending knees too much", "Rounding lower back"], tips: ["Feel a deep stretch in hamstrings before returning"], repRangeStrength: "4-6", repRangeHypertrophy: "8-12", repRangeEndurance: "12-15" },
  // Shoulders
  { name: "Overhead Press", muscleGroups: ["SHOULDERS", "TRICEPS"], equipment: ["BARBELL"], difficulty: "INTERMEDIATE", movementPattern: "PUSH", primaryMuscle: "SHOULDERS", description: "The foundational overhead push for shoulder strength and size.", instructions: ["Stand with bar on front deltoids, just outside shoulders", "Brace core and glutes", "Press bar straight up overhead", "Lock out at top", "Lower with control"], commonMistakes: ["Flaring elbows too wide", "Hyperextending lower back", "Not bracing core"], tips: ["Squeeze glutes to protect lower back"], repRangeStrength: "3-5", repRangeHypertrophy: "6-10", repRangeEndurance: "12-15" },
  { name: "Dumbbell Lateral Raise", muscleGroups: ["SHOULDERS"], equipment: ["DUMBBELL"], difficulty: "BEGINNER", movementPattern: "ISOLATION", primaryMuscle: "SHOULDERS", description: "Isolation exercise for medial deltoid width.", instructions: ["Hold dumbbells at sides", "Raise arms to shoulder height with slight bend in elbows", "Lead with elbows", "Lower with control"], commonMistakes: ["Using momentum to swing weight", "Raising above shoulder height", "Shrugging shoulders"], tips: ["Keep slight bend in elbow, lead with pinkies"], repRangeStrength: "N/A", repRangeHypertrophy: "15-20", repRangeEndurance: "20-25" },
  { name: "Face Pull", muscleGroups: ["SHOULDERS", "BACK"], equipment: ["CABLE"], difficulty: "BEGINNER", movementPattern: "PULL", primaryMuscle: "SHOULDERS", description: "Cable exercise for rear delts and external rotation.", instructions: ["Set cable at face height with rope attachment", "Pull rope to face with elbows high", "Externally rotate at end of movement", "Slowly return to start"], commonMistakes: ["Elbows dropping below shoulder height"], tips: ["Essential for shoulder health and posture"], repRangeStrength: "N/A", repRangeHypertrophy: "15-20", repRangeEndurance: "20-25" },
  // Biceps
  { name: "Barbell Curl", muscleGroups: ["BICEPS"], equipment: ["BARBELL"], difficulty: "BEGINNER", movementPattern: "ISOLATION", primaryMuscle: "BICEPS", description: "The classic bicep builder.", instructions: ["Stand with bar using underhand grip at shoulder width", "Curl bar to shoulder height", "Squeeze at top", "Lower with control"], commonMistakes: ["Swinging body for momentum", "Not fully extending at bottom"], tips: ["Keep elbows pinned to sides"], repRangeStrength: "5-8", repRangeHypertrophy: "10-12", repRangeEndurance: "15-20" },
  { name: "Hammer Curl", muscleGroups: ["BICEPS"], equipment: ["DUMBBELL"], difficulty: "BEGINNER", movementPattern: "ISOLATION", primaryMuscle: "BICEPS", description: "Neutral grip curl targeting the brachialis and biceps.", instructions: ["Hold dumbbells with neutral (hammer) grip", "Curl to shoulder height", "Lower with control"], commonMistakes: ["Rotating wrist during movement"], tips: ["Targets brachialis which makes arms look thicker"], repRangeStrength: "6-8", repRangeHypertrophy: "10-15", repRangeEndurance: "15-20" },
  // Triceps
  { name: "Tricep Pushdown", muscleGroups: ["TRICEPS"], equipment: ["CABLE"], difficulty: "BEGINNER", movementPattern: "ISOLATION", primaryMuscle: "TRICEPS", description: "Cable isolation exercise for triceps.", instructions: ["Set cable high with bar or rope attachment", "Keep elbows pinned to sides", "Extend arms fully downward", "Return with control"], commonMistakes: ["Letting elbows flare out", "Leaning too far forward"], tips: ["Full extension is key for tricep activation"], repRangeStrength: "6-8", repRangeHypertrophy: "10-15", repRangeEndurance: "15-20" },
  { name: "Skull Crusher", muscleGroups: ["TRICEPS"], equipment: ["BARBELL", "DUMBBELL"], difficulty: "INTERMEDIATE", movementPattern: "ISOLATION", primaryMuscle: "TRICEPS", description: "Lying tricep extension for long head development.", instructions: ["Lie on bench with bar/dumbbells above chest", "Lower weight toward forehead by bending only at elbows", "Extend arms back to start"], commonMistakes: ["Flaring elbows", "Using shoulders to assist"], tips: ["Keep upper arms vertical throughout"], repRangeStrength: "6-8", repRangeHypertrophy: "10-12", repRangeEndurance: "12-15" },
  // Legs
  { name: "Barbell Squat", muscleGroups: ["QUADS", "GLUTES", "HAMSTRINGS"], equipment: ["BARBELL"], difficulty: "INTERMEDIATE", movementPattern: "SQUAT", primaryMuscle: "QUADS", description: "The king of all lower body exercises.", instructions: ["Position bar on traps, just below C7", "Stand with feet shoulder-width, toes slightly out", "Take a big breath and brace core", "Squat down until thighs are parallel or below", "Drive through heels to stand"], commonMistakes: ["Knees caving inward", "Not squatting to depth", "Heel rising", "Forward lean"], tips: ["Push knees out over toes", "Chest up throughout"], repRangeStrength: "1-5", repRangeHypertrophy: "8-12", repRangeEndurance: "15-20" },
  { name: "Leg Press", muscleGroups: ["QUADS", "GLUTES"], equipment: ["MACHINE"], difficulty: "BEGINNER", movementPattern: "SQUAT", primaryMuscle: "QUADS", description: "Machine compound leg exercise, good for loading quads safely.", instructions: ["Sit in machine with back against pad", "Place feet shoulder-width on platform", "Release safety catches", "Lower knees to chest", "Press to near full extension"], commonMistakes: ["Not going through full range", "Locking out knees at top"], tips: ["High foot placement = more glutes, low = more quads"], repRangeStrength: "5-8", repRangeHypertrophy: "10-15", repRangeEndurance: "15-20" },
  { name: "Leg Curl", muscleGroups: ["HAMSTRINGS"], equipment: ["MACHINE"], difficulty: "BEGINNER", movementPattern: "ISOLATION", primaryMuscle: "HAMSTRINGS", description: "Isolation exercise for hamstring development.", instructions: ["Lie face down on machine", "Hook ankles under pad", "Curl legs to full flexion", "Lower with control"], commonMistakes: ["Lifting hips off pad", "Using momentum"], tips: ["Dorsiflex feet (toes up) for better hamstring activation"], repRangeStrength: "6-8", repRangeHypertrophy: "10-15", repRangeEndurance: "15-20" },
  { name: "Hip Thrust", muscleGroups: ["GLUTES", "HAMSTRINGS"], equipment: ["BARBELL"], difficulty: "BEGINNER", movementPattern: "HINGE", primaryMuscle: "GLUTES", description: "Isolation exercise for maximum glute development.", instructions: ["Sit with upper back against bench, bar across hips", "Place feet flat, knees bent at 90 degrees at top", "Drive hips upward until parallel", "Squeeze glutes at top", "Lower with control"], commonMistakes: ["Hyperextending lower back at top", "Feet too close or far"], tips: ["Tuck chin to chest to keep neutral spine"], repRangeStrength: "6-8", repRangeHypertrophy: "12-15", repRangeEndurance: "15-20" },
  { name: "Calf Raise", muscleGroups: ["CALVES"], equipment: ["MACHINE", "BODYWEIGHT"], difficulty: "BEGINNER", movementPattern: "ISOLATION", primaryMuscle: "CALVES", description: "Isolation exercise for calf development.", instructions: ["Stand on edge of platform on balls of feet", "Lower heels below platform level", "Rise up as high as possible on toes", "Hold briefly at top", "Lower slowly"], commonMistakes: ["Using fast, bouncy reps", "Not going through full range"], tips: ["Slow eccentric (3-4 seconds down) for better growth"], repRangeStrength: "N/A", repRangeHypertrophy: "15-20", repRangeEndurance: "20-30" },
  // Core
  { name: "Plank", muscleGroups: ["ABS"], equipment: ["BODYWEIGHT"], difficulty: "BEGINNER", movementPattern: "ISOLATION", primaryMuscle: "ABS", description: "Isometric core stability exercise.", instructions: ["Start in forearm or high plank position", "Maintain neutral spine - don't sag or pike", "Hold for prescribed time", "Breathe throughout"], commonMistakes: ["Sagging hips", "Holding breath"], tips: ["Squeeze glutes and abs simultaneously"], repRangeStrength: "30-60s", repRangeHypertrophy: "45-90s", repRangeEndurance: "2-5 min" },
  { name: "Cable Crunch", muscleGroups: ["ABS"], equipment: ["CABLE"], difficulty: "BEGINNER", movementPattern: "ISOLATION", primaryMuscle: "ABS", description: "Weighted ab exercise using cable for progressive overload.", instructions: ["Kneel below cable with rope attachment", "Hold rope at head level", "Crunch down, bringing elbows to thighs", "Squeeze abs at bottom", "Return to start"], commonMistakes: ["Pulling with arms not abs", "Not getting full range of motion"], tips: ["Think about bringing ribs to hips"], repRangeStrength: "N/A", repRangeHypertrophy: "12-15", repRangeEndurance: "15-20" },
];

async function main() {
  console.log("Seeding exercises...");

  for (const exercise of EXERCISES) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: {
        name: exercise.name,
        muscleGroups: exercise.muscleGroups as never,
        equipment: exercise.equipment as never,
        difficulty: exercise.difficulty as never,
        movementPattern: exercise.movementPattern as never,
        primaryMuscle: exercise.primaryMuscle as never,
        description: exercise.description,
        instructions: exercise.instructions,
        commonMistakes: exercise.commonMistakes,
        tips: exercise.tips,
        repRangeStrength: exercise.repRangeStrength,
        repRangeHypertrophy: exercise.repRangeHypertrophy,
        repRangeEndurance: exercise.repRangeEndurance,
        isEncyclopedia: true,
      },
    });
  }

  console.log(`Seeded ${EXERCISES.length} exercises.`);

  // Seed sample badges
  const badges = [
    { name: "First Workout", description: "Logged your first workout", color: "#39FF14", criteria: { type: "workout_count", count: 1 } },
    { name: "Week Warrior", description: "7-day workout streak", color: "#FF6B2B", criteria: { type: "streak", days: 7 } },
    { name: "30-Day Legend", description: "30-day workout streak", color: "#F59E0B", criteria: { type: "streak", days: 30 } },
    { name: "Century Club", description: "Logged 100 workouts", color: "#3B82F6", criteria: { type: "workout_count", count: 100 } },
    { name: "PR Machine", description: "Set 10 personal records", color: "#8B5CF6", criteria: { type: "pr_count", count: 10 } },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  console.log("Seeded badges.");
  console.log("Seeding complete! (buddy finder shows real registered users only)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
