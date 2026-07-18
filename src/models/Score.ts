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
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Explicitly register the model or export the existing one, forcing the collection name 'scores'
export default mongoose.models.Score ||
  mongoose.model<IScore>("Score", ScoreSchema, "scores");
