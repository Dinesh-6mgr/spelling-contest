import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionNo: { type: Number, required: true, unique: true }, // unique SN
    answer: { type: String, required: true },        // normalized value for checking
    originalAnswer: { type: String, required: true },// shown in UI when revealed
    audioUrl: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
