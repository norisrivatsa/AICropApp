import { Season } from "@/lib/types";

export function inferSeason(month = new Date().getMonth() + 1): Season {
  if ([6, 7, 8, 9, 10].includes(month)) return "kharif";
  if ([11, 12, 1, 2, 3].includes(month)) return "rabi";
  return "zaid";
}
