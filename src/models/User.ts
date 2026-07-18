import mongoose, { Schema, Document } from "mongoose";

// 1. Define the sub-document structures for analytics
interface ICategoryStats {
  correct: number;
  total: number;
}

interface IDifficultyStats {
  correct: number;
  total: number;
}

// 2. Define the main TypeScript structure for the User
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  gamesPlayed: number;
  highScore: number;
  // Track accuracy by category (e.g., statsByCategory.get('History'))
  statsByCategory: Map<string, ICategoryStats>;
  // Track accuracy by difficulty level
  statsByDifficulty: {
    easy: IDifficultyStats;
    medium: IDifficultyStats;
    hard: IDifficultyStats;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 3. Define the Mongoose schema
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    gamesPlayed: { type: Number, default: 0 },
    highScore: { type: Number, default: 0 },

    // Mongoose Map allows dynamic keys for categories, each mapping to an object with correct and total counts
    statsByCategory: {
      type: Map,
      of: new Schema(
        {
          correct: { type: Number, default: 0 },
          total: { type: Number, default: 0 },
        },
        { _id: false },
      ),
      default: {},
    },

    // Fixed object since difficulties (easy, medium, hard) rarely change
    statsByDifficulty: {
      easy: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
      medium: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
      hard: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true },
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
