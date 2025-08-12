import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    teams: {
      row: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }],
      column: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }],
    },
    solutions: {
      type: Map,
      of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const GridGame = mongoose.model('GridGame', gameSchema);
export default GridGame;
