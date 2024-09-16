export const money = (amount) => {
  let money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return money.format(Number(amount / 100)).replace("$", "");
};
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
