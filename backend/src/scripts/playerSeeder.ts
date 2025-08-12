import mongoose from "mongoose";
import dotenv from "dotenv";
import { createPlayer } from "../utils/Player.utils";

dotenv.config();
mongoose.connect(process.env.MONGO_URI!);

const START_ID = 25;
const END_ID = 10000;

(async () => {
   await createPlayer({START_ID, END_ID});
   process.exit();
})();
