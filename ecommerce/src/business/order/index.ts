import isValidCPF from "../../shared/utils/is-valid-cpf.util";
import { Product, Coupons } from "./types/order.type";

export default class Order {
  constructor(
    readonly cpf: string,
    readonly products: Product[],
    readonly coupon?: Coupons
  ) {
    if (!isValidCPF(cpf)) throw new Error("Invalid CPF");
  }

  calculateAmount(): number {
    let amount = 0;
    this.products.map((product) => {
      amount += product.price * product.quantity;
    });
    return this.coupon ? this.applyCoupon(amount) : amount;
  }

  applyCoupon(amount: number): number {
    const percentualDiscount = this.getPercentualDiscountByCoupon();
    return amount - (amount * percentualDiscount) / 100;
  }

  getPercentualDiscountByCoupon() {
    const CouponsPercentualDiscount = {
      [Coupons.BlackFriday]: 10,
      [Coupons.Christmas]: 20,
    };
    return CouponsPercentualDiscount[this.coupon as Coupons];
  }
}
