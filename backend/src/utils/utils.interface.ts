export type Month =
   | "January"
   | "February"
   | "March"
   | "April"
   | "May"
   | "June"
   | "July"
   | "August"
   | "September"
   | "October"
   | "November"
   | "December";

export interface IFetchPlayerResponse {
   playerId: number;
   name: string;
   country: string;
   dob: string;
   birthPlace: string;
   role: string;
   teams: string[];
   profileImage: string;
}

export interface ICreatePlayerParams {
   START_ID: number;
   END_ID: number;
}

export interface INewGameWithSolutions {
   teams: number[];
   teamData: any[];
   teamPlayersMap: any;
}
