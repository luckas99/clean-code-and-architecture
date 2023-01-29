import Order from "../src/business/order";
import { Product, Coupons } from "../src/business/order/types/order.type";

test("Should create an order with 3 products and calculate total value", function () {
  const products: Product[] = [
    { description: "iPhone 12", price: 3000, quantity: 1 },
    { description: "iPhone 13", price: 4000, quantity: 2 },
    { description: "iPhone 14", price: 5000, quantity: 1 },
  ];
  const order = new Order("517.432.450-76", products);
  const amount = order.calculateAmount();
  expect(amount).toBe(16000);
});

test("Should create an order with 3 products, associate a coupon and calculate total value", function () {
  const products: Product[] = [
    { description: "iPhone 12", price: 3000, quantity: 1 },
    { description: "iPhone 13", price: 4000, quantity: 2 },
    { description: "iPhone 14", price: 5000, quantity: 1 },
  ];
  const order = new Order("517.432.450-76", products, Coupons.BlackFriday);
  const amount = order.calculateAmount();
  expect(amount).toBe(14400);
});

test("Should not create an order with a invalid CPF", function () {
  const products: Product[] = [
    { description: "iPhone 12", price: 3000, quantity: 1 },
  ];
  expect(() => new Order("517.432.450-00", products)).toThrow(
    new Error("Invalid CPF")
  );
});
