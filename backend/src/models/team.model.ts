import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         unique: true,
         trim: true,
      },
      alias: {
         type: String,
         required: true,
         unique: true,
         trim: true,
      },
      type: {
         type: String,
         required: true,
         trim: true,
      },
      level: {
         type: String,
         required: true,
         trim: true,
      },
      other_name: {
         type: String,
         trim: true,
      },
      logo: {
         type: String,
         required: true,
      },
   },
   {
      timestamps: true,
   }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;    