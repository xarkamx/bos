export function numberPadStart (places:number, number:number) {
  return String(number).padStart(places, "0");
}