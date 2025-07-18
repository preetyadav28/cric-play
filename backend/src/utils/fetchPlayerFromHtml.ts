import axios from "axios";
import cheerio from "cheerio";
import { getPlayerDetails } from "./Utilities";
import { IFetchPlayerResponse } from "./utils.interface";
import { uploadImageFromUrl } from "../middleware/upload";

const BASE_URL = "https://www.cricbuzz.com/profiles";

export const fetchPlayer = async (id: number): Promise<IFetchPlayerResponse> => {
   console.log("🚀 ~ fetchPlayer ~ id:", id);
   try {
      const { data: response } = await axios.get(`${BASE_URL}/${id}`);

      const { name, country, dob, birthPlace, role, teams, profileImage } =
         getPlayerDetails(response);
      console.log("🚀 ~ fetchPlayer ~ profileImage:", profileImage);

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
};

// (async function (id: number) {
//   const {profileImage} = await fetchPlayer(id);
//   console.log("🚀 ~ profileImage:", profileImage)
//   const imageUrl = await uploadImageFromUrl(profileImage as string);
//   console.log("🚀 ~ imageUrl:", imageUrl)
// })(27);
