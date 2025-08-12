import dotenv from "dotenv";
import GridGame from "../../models/gridGame.model";
import mongoose from "mongoose";
import {
   generateNewGame,
   getNewGameWithSolutions,
} from "../../utils/GridGame.utils";
import { INewGameWithSolutions } from "../../utils/utils.interface";

dotenv.config();

(async () => {
   try {
      await mongoose.connect(process.env.MONGO_URI!);
      const finalResult =
         (await generateNewGame()) || ({} as INewGameWithSolutions);
      const newGameData = getNewGameWithSolutions(finalResult);
      const game = await GridGame.create({
         teams: newGameData.teams,
         solutions: newGameData.solutions,
      });

      console.log("✅ Game saved:", game._id);

      process.exit(0);
   } catch (err) {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
   }
})();
