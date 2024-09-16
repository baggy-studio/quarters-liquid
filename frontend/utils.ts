export const money = (amount) => {
  let money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return money.format(Number(amount / 100)).replace("$", "");
};


export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;
export const invlerp = (x: number, y: number, a: number) => clamp((a - x) / (y - x));
export const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a));
export const range = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  a: number
) => lerp(x2, y2, invlerp(x1, y1, a));