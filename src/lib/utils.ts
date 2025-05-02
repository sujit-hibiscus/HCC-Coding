import { clsx, type ClassValue } from "clsx";
import { endOfWeek, format, isMatch, parseISO, startOfWeek } from "date-fns";
import { twMerge } from "tailwind-merge";

export const StartDateFilter = startOfWeek(new Date(), { weekStartsOn: 1 }); // week starts on Monday
export const EndDateFilter = endOfWeek(new Date(), { weekStartsOn: 1 });

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const maskFileName = (name: string): string => {
  if (!name) return "";

  const parts = name.split(" ");
  const extension = parts.length > 1 ? parts.pop() : "";
  const baseName = parts.join(" ");

  if (baseName.length <= 6) {
    return `${baseName} ${extension}`;
  }

  const start = baseName.slice(0, 2);
  const end = baseName.slice(-2);

  const middleIndex = Math.floor(baseName.length / 2);
  const middle = baseName.slice(middleIndex - 1, middleIndex + 1);

  const generateHash = (str: string, seed: number): string => {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 4);
  };

  const hash1 = generateHash(baseName, 1);
  const hash2 = generateHash(baseName, 2);

  const maskedName = `${start}_${hash1}_${middle}_${hash2}_${end}`;

  return `${maskedName}_${extension}`;
};

export function formatToMMDDYYYYIfNeeded(dateStr: string): string {
  if (isMatch(dateStr, "MM-dd-yyyy")) {
    return dateStr;
  }

  const date = parseISO(dateStr);
  return format(date, "MM-dd-yyyy");
}


export const stringToFormattedDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "MM-dd-yyyy");
  } catch (error) {
    console.error("Invalid date format", error);
    return "";
  }
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filterData = <T extends Record<string, any>>(dataArray: T[], searchTerm: string): T[] => {
  if (!Array.isArray(dataArray) || !searchTerm) return dataArray;

  const lowerCaseSearch = searchTerm.toLowerCase();

  return dataArray.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(lowerCaseSearch)
    )
  );
};


export const DateToFormattedDate = (date: Date): string => {
  try {
    return format(date, "MM-dd-yyyy");
  } catch (error) {
    console.error("Invalid date format", error);
    return "";
  }
};

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
};

