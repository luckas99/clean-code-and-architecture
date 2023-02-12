export interface Product {
  price: number;
  quantity: number;
  description: string;
}

export enum Coupons {
  BlackFriday = "BF10OFF",
  Christmas = "CT20OFF",
}
