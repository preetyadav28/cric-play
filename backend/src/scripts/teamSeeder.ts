import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import teams from "../assets/teams.json";

const API_BASE = "http://localhost:5000/api/teams";

const uploadLogo = async (filePath: string) => {
   try {
      const form = new FormData();
      const absolutePath = path.resolve(filePath);
      form.append("logo", fs.createReadStream(absolutePath));

      const response = await axios.post(`${API_BASE}/upload-logo`, form, {
         headers: form.getHeaders(),
      });

      return response.data.logoUrl;
   } catch (error) {
      console.log("🚀 ~ uploadLogo ~ error:", error);
      console.error("Error uploading logo:", (error as any).message);
      return null;
   }
};

const createTeam = async (team: any) => {
   try {
      const logoUrl = await uploadLogo(team.logo);
      console.log("🚀 ~ createTeam ~ logoUrl:", logoUrl);
      if (!logoUrl) {
         console.warn(`Skipping team ${team.name} due to logo upload failure.`);
         return;
      }

      const response = await axios.post(API_BASE, {
         ...team,
         logo: logoUrl,
      });

      console.log(`✅ Created team: ${response}`);
   } catch (error:any) {
      console.error(
         `❌ Error creating team ${team.name}:`,
        //  error?.response?.data?.error
       error && error?.response && error?.response?.data
      );
   }
};

(async () => {
   for (const team of teams) {
      await createTeam(team);
   }
})();
