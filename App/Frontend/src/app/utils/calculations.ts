import { Transaction } from "../types";

export function calculateTotal(transactions: Transaction[]) {
  return transactions.reduce(
    (sum, t) => sum + t.quantity * t.price,
    0
  );
}
