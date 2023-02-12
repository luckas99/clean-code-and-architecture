import CurrencyGateway from "../currency/currency.gateway";
import CouponRepositoryInterface from "../repositories/coupon/coupon-repository.interface";
import { CouponRepository } from "../repositories/coupon/coupon.repository";
import OrderRepository from "../repositories/order/order.repository";
import ProductRepository from "../repositories/product/product-repository.interface";
import ProductRepositoryInterface from "../repositories/product/product.repository";
import isValidCPF from "../shared/utils/is-valid-cpf.util";
import FreightCalculator from "./freight-calculator";

export type Input = {
  cpf: string;
  items: { idProduct: number; quantity: number }[];
  coupon?: string;
  from?: string;
  to?: string;
};

export type Output = {
  total: number;
  freight: number;
  orderId: string;
};

export default class Checkout {
  constructor(
    readonly currencyGateway: CurrencyGateway = new CurrencyGateway(),
    readonly productRepository: ProductRepositoryInterface = new ProductRepository(),
    readonly couponRepository: CouponRepositoryInterface = new CouponRepository(),
    readonly orderRepository: OrderRepository = new OrderRepository()
  ) {}

  private validateCPF(cpf: string) {
    const isValid = isValidCPF(cpf);
    if (!isValid) throw new Error("Invalid cpf");
  }

  private validateDimensions(productData: any) {
    if (
      productData.width <= 0 ||
      productData.height <= 0 ||
      productData.length <= 0 ||
      parseFloat(productData.weight) <= 0
    )
      throw new Error("Invalid dimension");
  }

  private generateOrderId() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const date = new Date();
    return date.getFullYear() + result;
  }

  private async validateCoupon(code: string): Promise<boolean> {
    const couponData = await this.couponRepository.getCoupon(code);
    return couponData ? true : false;
  }

  async execute(input: Input): Promise<Output> {
    this.validateCPF(input.cpf);
    const output: Output = {
      total: 0,
      freight: 0,
      orderId: "",
    };
    const currencies = await this.currencyGateway.getCurrencies();
    const items: number[] = [];
    if (input.items) {
      for (const item of input.items) {
        if (item.quantity <= 0) throw new Error("Invalid quantity");
        if (items.includes(item.idProduct)) throw new Error("Duplicated item");
        const productData = await this.productRepository.getProduct(
          item.idProduct
        );
        this.validateDimensions(productData);
        if (productData.currency === "USD") {
          output.total +=
            parseFloat(productData.price) * item.quantity * currencies.usd;
        } else {
          output.total += parseFloat(productData.price) * item.quantity;
        }
        const itemFreight = FreightCalculator.calculate(productData);
        output.freight += Math.max(itemFreight, 10) * item.quantity;
        items.push(item.idProduct);
      }
    }
    if (input.coupon) {
      const couponData = await this.couponRepository.getCoupon(input.coupon);
      if (!couponData) {
        throw new Error("Invalid Coupon");
      }
      if (couponData.expire_date.getTime() >= new Date().getTime()) {
        const percentage = parseFloat(couponData.percentage);
        output.total -= (output.total * percentage) / 100;
      }
    }
    if (input.from && input.to) {
      output.total += output.freight;
    }
    output.orderId = this.generateOrderId();
    this.orderRepository.save({
      orderId: output.orderId,
      cepFrom: input.from as string,
      cepTo: input.to as string,
      price: output.total,
    });
    return output;
  }
}
