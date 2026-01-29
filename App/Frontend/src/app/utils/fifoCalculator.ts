import { Transaction } from "../types";

export function fifo(transactions: Transaction[]) {
  const buys: Transaction[] = [];
  let profit = 0;

  transactions.forEach((t) => {
    if (t.type === "buy") {
      buys.push({ ...t });
    } else {
      let qty = t.quantity;
      while (qty > 0 && buys.length) {
        const buy = buys[0];
        const used = Math.min(qty, buy.quantity);
        profit += used * (t.price - buy.price);
        buy.quantity -= used;
        qty -= used;
        if (buy.quantity === 0) buys.shift();
      }
    }
  });

  return profit;
}
