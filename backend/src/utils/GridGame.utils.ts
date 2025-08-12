import Player from "../models/player.model";
import Team from "../models/team.model";
import { INewGameWithSolutions } from "./utils.interface";

async function generateNewGame() {
      try {
         const players: Array<{ _id: string; teams: string[] }> =
            await Player.find();
         const teamData = await Team.find({}).lean();

         if (!teamData || teamData.length < 6) {
            throw new Error("Not enough teams to generate a game.");
         }

         if (!players || players.length < 10) {
            throw new Error("Not enough players to generate a game.");
         }

         const teamDataLength = teamData.length;
         const teamsNeeded = 6;
         const teamPlayersMap = getPlayersTeamsMap({
            players,
         });

         let generatedIndices: number[] = [];

         for (let i = 0; i < teamsNeeded; i++) {
            const indices = getRandomIndices({
               indices: generatedIndices,
               teamDataLength,
            });
            generatedIndices = [...indices];
         }

         const finalTeams = getFinalTeams({
            indices: generatedIndices,
            teamData,
            teamPlayersMap,
            teamsNeeded,
         });
         return finalTeams;
      } catch (error) {
         console.error("Error generating new game:", error);
      }

}

function getPlayersTeamsMap({
   players,
}: {
   players: Array<{ _id: string; teams: any[] }>;
}) {
   const teamPlayersMap: { [key: string]: string[] } = {};

   for (let player of players) {
      const { _id, teams } = player;
      for (let l = 0; l < teams.length; l++) {
         for (let m = l + 1; m < teams.length; m++) {
            const combinedTeamIds = `${teams[l]?._id?.toString()}_${teams[m]?._id?.toString()}`;
            if (teamPlayersMap[combinedTeamIds]) {
               teamPlayersMap[combinedTeamIds] = [
                  ...teamPlayersMap[combinedTeamIds],
                  _id.toString(),
               ];
            } else {
               teamPlayersMap[combinedTeamIds] = [_id.toString()];
            }
         }
      }
   }
   return teamPlayersMap;
}

function getRandomIndices({
   indices,
   teamDataLength,
}: {
   indices: number[];
   teamDataLength: number;
}) {
   const randomIndex = Math.ceil(Math.random() * (teamDataLength - 1));
   if (!indices.includes(randomIndex)) {
      indices.push(randomIndex);
   } else {
      getRandomIndices({ indices, teamDataLength });
   }
   return indices;
}

function generateValidTeams({
   teamData,
   teamPlayersMap,
   indices,
}: {
   teamData: any[];
   teamPlayersMap: any;
   indices: number[];
}) {
   const allTeamIndices = Array.from({ length: teamData.length }, (_, i) => i);
   const half = indices.length / 2;
   let generatedTeamsIndices = [...indices];

   const MAX_ATTEMPTS = 2000;
   let attempt = 0;

   while (attempt < MAX_ATTEMPTS) {
      attempt++;
      let isValid = true;

      for (let n = 0; n < half; n++) {
         const primaryTeamIndex = generatedTeamsIndices[n];
         const primaryTeamName = teamData[primaryTeamIndex]?._id;

         for (let p = half; p < generatedTeamsIndices.length; p++) {
            const secondaryTeamIndex = generatedTeamsIndices[p];
            const secondaryTeamName = teamData[secondaryTeamIndex]?._id;

            const combinedName = `${primaryTeamName}_${secondaryTeamName}`;
            const playersArr = teamPlayersMap[combinedName] || [];

            if (!playersArr.length) {
               isValid = false;

               let replaced = false;
               let unusedIndices = allTeamIndices.filter(
                  (i) => !generatedTeamsIndices.includes(i)
               );

               for (let i = 0; i < unusedIndices.length; i++) {
                  const newSecondaryIndex = unusedIndices[i];
                  const newSecondaryName = teamData[newSecondaryIndex]?._id;
                  const newCombinedName = `${primaryTeamName}_${newSecondaryName}`;
                  const newPlayersArr = teamPlayersMap[newCombinedName] || [];

                  if (newPlayersArr.length) {
                     generatedTeamsIndices[p] = newSecondaryIndex;
                     replaced = true;
                     break;
                  }
               }

               if (!replaced) {
                  for (let i = 0; i < unusedIndices.length; i++) {
                     const newPrimaryIndex = unusedIndices[i];
                     const newPrimaryName = teamData[newPrimaryIndex]?._id;
                     const newCombinedName = `${newPrimaryName}_${secondaryTeamName}`;
                     const newPlayersArr =
                        teamPlayersMap[newCombinedName] || [];

                     if (newPlayersArr.length) {
                        generatedTeamsIndices[n] = newPrimaryIndex;
                        replaced = true;
                        break;
                     }
                  }
               }

               if (!replaced) {
                  throw new Error(
                     `Failed to get valid team combo: ${combinedName}`
                  );
               }
               break;
            }
         }

         if (!isValid) break;
      }

      if (isValid) {
         return generatedTeamsIndices;
      }
   }

   throw new Error("Max attempts reached.");
}

function getFinalTeams({
   indices,
   teamData,
   teamPlayersMap,
   teamsNeeded,
}: {
   indices: number[];
   teamData: any[];
   teamPlayersMap: any;
   teamsNeeded: number;
}) {
   try {
      const teams = generateValidTeams({ teamData, teamPlayersMap, indices });
      return {teams, teamData, teamPlayersMap};
   } catch (e) {
      console.log("error", e);
      let newIndices: number[] = [];
      for (let i = 0; i < teamsNeeded; i++) {
         const temp = getRandomIndices({
            indices: newIndices,
            teamDataLength: teamData.length,
         });
         newIndices = [...temp];
      }
      console.log("temp", newIndices);
      return getFinalTeams({
         indices: newIndices,
         teamData,
         teamPlayersMap,
         teamsNeeded,
      });
   }
}

function getNewGameWithSolutions({teams, teamData, teamPlayersMap}: INewGameWithSolutions) {
   const solutions: { [key: string]: string[] } = {};
   for (let i = 0; i < teams.length / 2; i++) {
      for(let j = teams.length / 2; j < teams.length; j++) {
         solutions[`${teamData[teams[i]]._id}_${teamData[teams[j]]._id}`] = (teamPlayersMap as { [key: string]: string[] })[
            `${teamData[teams[i]]._id}_${teamData[teams[j]]._id}`
         ];
      }
   }
   const teamsColumn = [];
   const teamsRow = [];

   for (let i = 0; i < teams.length; i++) {
      if(i < teams.length / 2) {
         teamsRow.push(teamData[teams[i]]);
      } else {
         teamsColumn.push(teamData[teams[i]]);
      }
   }

   return {
      solutions,
      teams: {
         row: teamsRow,
         column: teamsColumn,
      }
   }
}

export {
    generateNewGame,
    getNewGameWithSolutions,
}