export function numberPadStart (places:number, number:number) {
  return String(number).padStart(places, "0");
}

export function trimAllStringsInObject (obj:any) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].trim();
    }
  }
}