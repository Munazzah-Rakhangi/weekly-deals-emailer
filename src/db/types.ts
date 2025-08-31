export type DealInput = {
  retailer: string;
  product: string;
  size: string | null;
  price: number;
  start: string; // ISO date
  end: string;   // ISO date
  category: string | null;
};
