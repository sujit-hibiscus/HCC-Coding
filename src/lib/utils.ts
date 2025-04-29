import { clsx, type ClassValue } from "clsx";
import { endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { redirect } from "next/navigation";
import { twMerge } from "tailwind-merge";

export const StartDateFilter = startOfWeek(new Date(), { weekStartsOn: 1 }); // week starts on Monday
export const EndDateFilter = endOfWeek(new Date(), { weekStartsOn: 1 });

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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




export async function logout() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      redirect("/");
    } else {
      console.error("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

