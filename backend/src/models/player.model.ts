import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profileImage: { type: String, required: true },
    playerId: { type: String, required: true, unique: true},
    country: String,
    dob: String,
    birthPlace: { type: String },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    role: String,
  },
  { timestamps: true }
);

const Player = mongoose.model('Player', playerSchema);
export default Player;
