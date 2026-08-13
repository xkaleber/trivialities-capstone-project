import mongoose, { Schema, Document } from "mongoose";

export interface IScore extends Document {
  userId: string;
  categoryId: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  createdAt: Date;
}

const ScoreSchema: Schema = new Schema({
  // 👇 Explicitly links the text ID field back to the User database collection
  userId: { type: String, required: true, ref: "User" },
  categoryId: { type: String, required: true },
  difficulty: { type: String, required: true },
  score: {
    type: Number,
    required: true,
    min: [0, "Score cannot be negative"], // ✨ Added boundary to prevent negative scores and malicious inserts
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: [1, "Total questions must be at least 1"], // ✨ Added boundary to prevent zero or negative total questions and malicious inserts
  },
  createdAt: { type: Date, default: Date.now },
});

// Explicitly register the model or export the existing one, forcing the collection name 'scores'
export default mongoose.models.Score ||
  mongoose.model<IScore>("Score", ScoreSchema, "scores");
