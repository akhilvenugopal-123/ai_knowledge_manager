import mongoose, { Schema, models, model } from "mongoose";

const NoteSchema = new Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      default: "",
    },

    // 🔐 Link note to logged-in user
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ⚡ faster queries
    },
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt automatically
  }
);

// Prevent model overwrite in Next.js
export default models.Note || model("Note", NoteSchema);