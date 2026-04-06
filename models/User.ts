import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: false, // Optional
  },

  image: String, //  Google profile image

  provider: {
    type: String,
    default: "credentials", // or "google"
  },
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);