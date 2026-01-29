import { Transaction } from "../types";

export function parseExcel(data: any[]): Transaction[] {
  return data.map((row, index) => ({
    id: index,
    date: row.date,
    type: row.type,
    asset: row.asset,
    quantity: Number(row.quantity),
    price: Number(row.price),
  }));
}
