import * as cheerio from "cheerio";
import axios from "axios";
import { IFetchPlayerResponse } from "./utils.interface";
import { CRICBUZZ_BASE_URL } from "./Constants";
import { ICreatePlayerParams, Month } from "./utils.interface";
import Player from "../models/player.model";
import Team from "../models/team.model";
import { uploadImageFromUrl } from "../middleware/upload";
import { MONTH_MAPPING, PROFILE_TAG_TITLE } from "./Constants";

function getPlayerDetails(html: string) {
   const $ = cheerio.load(html);
   const name = $('h1[itemprop="name"].cb-font-40').text().trim();
   const country = $("h3.cb-font-18.text-gray").text().trim();

   let dob = "";
   const bornLabel = $("div.cb-col.cb-col-40.text-bold.cb-lst-itm-sm").filter(
      (_, el) => $(el).text().trim() === "Born"
   );
   if (bornLabel.length > 0) {
      const dobText = bornLabel.next().text().trim().split("(")[0].trim();
      const [month, date, year] = dobText.split(" ");
      dob = `${date?.slice(0, 2)}/${MONTH_MAPPING[month as Month]}/${year}`;
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
      dob: dob ?? "no dob",
      birthPlace,
      role,
      teams,
      profileImage: profileImage?.includes("182026") ? "" : profileImage,
   };
};

async function fetchPlayer (id: number): Promise<IFetchPlayerResponse> {
   try {
      const { data: response } = await axios.get(`${CRICBUZZ_BASE_URL}/${id}`);
      const { name, country, dob, birthPlace, role, teams, profileImage } =
         getPlayerDetails(response);

      if (!name) return {} as IFetchPlayerResponse;

      return {
         playerId: id,
         name,
         country,
         dob,
         birthPlace,
         role,
         teams,
         profileImage,
      };
   } catch (error) {
      console.log("🚀 ~ fetchPlayer ~ error:", error);
      return {} as IFetchPlayerResponse;
   }
}

export async function createPlayer({START_ID, END_ID}: ICreatePlayerParams) {
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
      let imageUrl = "";
      if (profileImage) {
         imageUrl = (await uploadImageFromUrl(profileImage as string)) || "";
      }

      await Player.create({
         ...player,
         profileImage: imageUrl || "dummy",
         teams: teamIds,
      });

      result = { ...result, [id]: "Added" };
   }

   console.log("🏁 Done.");
   return result;
};
