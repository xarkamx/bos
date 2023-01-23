// A fucntion that replaces the keys from camelCase to snake_case
export function snakeCaseReplacer(obj: any) {
  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    const newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    newObj[newKey] = obj[key];
  });
  return newObj;
}
