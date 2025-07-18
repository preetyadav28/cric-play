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
