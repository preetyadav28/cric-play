import * as cheerio from "cheerio";
import { Month } from "./utils.interface";
import Player from "../models/player.model";
import { fetchPlayer } from "./fetchPlayerFromHtml";
import Team from "../models/team.model";
import { uploadImageFromUrl } from "../middleware/upload";

const PROFILE_TAG_TITLE = "profile image";

const monthMapping: Record<Month, string> = {
   January: "01",
   February: "02",
   March: "03",
   April: "04",
   May: "05",
   June: "06",
   July: "07",
   August: "08",
   September: "09",
   October: "10",
   November: "11",
   December: "12",
};

export function getPlayerDetails(html: string) {
   const $ = cheerio.load(html);

   const name = $('h1[itemprop="name"].cb-font-40').text().trim();
   const country = $("h3.cb-font-18.text-gray").text().trim();

   let dob = "";
   const bornLabel = $("div.cb-col.cb-col-40.text-bold.cb-lst-itm-sm").filter(
      (_, el) => $(el).text().trim() === "Born"
   );
   if (bornLabel.length > 0) {
      const dobText = bornLabel.next().text().trim().split("(")[0].trim(); // Remove age part
      const [month, date, year] = dobText.split(" ");
      dob = `${date.slice(0, 2)}/${monthMapping[month as Month]}/${year}`;
   }

   const birthPlace = $("div.cb-col.cb-col-40.text-bold.cb-lst-itm-sm")
      .filter((_, el) => $(el).text().trim() === "Birth Place")
      .next()
      .text()
      .trim();

   const role = $("div.cb-col.cb-col-40.text-bold.cb-lst-itm-sm")
      .filter((_, el) => $(el).text().trim() === "Role")
      .next()
      .text()
      .trim();

   const teamsString = $("div.cb-col.cb-col-40.text-bold.cb-lst-itm-sm")
      .filter((_, el) => $(el).text().trim() === "Teams")
      .next()
      .text()
      .trim();

   const teams = teamsString ? teamsString.split(",").map((t) => t.trim()) : [];

   const profileImage =
      $(`img[title="${PROFILE_TAG_TITLE}"]`).attr("src") || "";

   return {
      name,
      country,
      dob,
      birthPlace,
      role,
      teams,
      profileImage,
   };
}

export async function syncPlayer(START_ID: number, END_ID: number) {
   let result = {};
   for (let id = START_ID; id <= END_ID; id++) {
      const existing = await Player.findOne({ playerId: id });
      const { profileImage, teams, ...player } = (await fetchPlayer(id)) || {};
      const teamIds = [];
      if (Array.isArray(teams) && teams.length > 0) {
         for (const team of teams) {
            const teamDoc = await Team.findOne({ name: team });
            if (teamDoc) {
               teamIds.push({ _id: teamDoc._id });
            }
         }
      }
      if (existing) {
         await Player.updateOne({ playerId: id }, { teams: teamIds });
         result = { ...result, [id]: "Updated" };
         continue;
      }

      if (!player || Object.keys(player).length === 0) continue;

      const imageUrl = await uploadImageFromUrl(profileImage as string);

      await Player.create({
         ...player,
         profileImage: imageUrl || "",
         teams: teamIds,
      });

      result = { ...result, [id]: "Added" };

      console.log(`✅ Added: ${player.name} (ID: ${id})`);
   }

   console.log("🏁 Done.");
   return result;
}
