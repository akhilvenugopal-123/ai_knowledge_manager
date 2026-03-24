import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  title: String,
  content: String,
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Note ||
  mongoose.model("Note", NoteSchema);