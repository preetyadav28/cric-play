import mongoose from "mongoose";
import dotenv from "dotenv";
import Player from "../models/player.model";
import { fetchPlayer } from "../utils/fetchPlayerFromHtml";
import { uploadImageFromUrl } from "../middleware/upload";
import Team from "../models/team.model";
import { syncPlayer } from "../utils/Utilities";

dotenv.config();
mongoose.connect(process.env.MONGO_URI!);

const START_ID = 25;
const END_ID = 10000;

(async () => {
  await syncPlayer(START_ID, END_ID);
  process.exit();
})();
