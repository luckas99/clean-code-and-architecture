import axios from "axios";
import Checkout from "../src/Checkout";
import FreightCalculator from "../src/checkout/freight-calculator";
import CurrencyGateway from "../src/currency/currency.gateway";
import OrderRepository from "../src/repositories/order/order.repository";
import ProductRepository from "../src/repositories/product/product-repository.interface";

let checkout: Checkout;

beforeEach(function () {
  checkout = new Checkout();
});

test("Não deve aceitar um pedido com cpf inválido", async function () {
  const input = {
    cpf: "406.302.170-27",
    items: [],
  };
  expect(() => checkout.execute(input)).rejects.toThrow(
    new Error("Invalid cpf")
  );
});

test("Deve criar um pedido vazio", async function () {
  const input = {
    cpf: "407.302.170-27",
    items: [],
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(0);
});

test("Deve criar um pedido com 3 produtos", async function () {
  const input = {
    cpf: "407.302.170-27",
    items: [
      { idProduct: 1, quantity: 1 },
      { idProduct: 2, quantity: 1 },
      { idProduct: 3, quantity: 3 },
    ],
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(6090);
});

test("Deve criar um pedido com 3 produtos com cupom de desconto", async function () {
  const input = {
    cpf: "407.302.170-27",
    items: [
      { idProduct: 1, quantity: 1 },
      { idProduct: 2, quantity: 1 },
      { idProduct: 3, quantity: 3 },
    ],
    coupon: "VALE20",
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(4872);
});

test("Deve criar um pedido com 3 produtos com cupom de desconto expirado", async function () {
  const input = {
    cpf: "407.302.170-27",
    items: [
      { idProduct: 1, quantity: 1 },
      { idProduct: 2, quantity: 1 },
      { idProduct: 3, quantity: 3 },
    ],
    coupon: "VALE10",
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(6090);
});

test("Não deve criar um pedido com quantidade negativa", async function () {
  const input = {
    cpf: "407.302.170-27",
    items: [{ idProduct: 1, quantity: -1 }],
  };
  expect(() => checkout.execute(input)).rejects.toThrow(
    new Error("Invalid quantity")
  );
});

test("Não deve criar um pedido com item duplicado", async function () {
  const input = {
    cpf: "407.302.170-27",
    items: [
      { idProduct: 1, quantity: 1 },
      { idProduct: 1, quantity: 1 },
    ],
  };
  expect(() => checkout.execute(input)).rejects.toThrow(
    new Error("Duplicated item")
  );
});

test("Deve criar um pedido com 1 produto calculando o frete", async function () {
  const input = {
    cpf: "407.302.170-27",
    items: [{ idProduct: 1, quantity: 3 }],
    from: "22060030",
    to: "88015600",
  };
  const output = await checkout.execute(input);
  expect(output.freight).toBe(90);
  expect(output.total).toBe(3090);
});

test("Não deve criar um pedido se o produto tiver alguma dimensão negativa", async function () {
  const input = {
    cpf: "407.302.170-27",
    items: [{ idProduct: 4, quantity: 1 }],
  };
  expect(() => checkout.execute(input)).rejects.toThrow(
    new Error("Invalid dimension")
  );
});

test("Deve criar um pedido com 1 produto calculando o frete com valor mínimo", async function () {
  const input = {
    cpf: "407.302.170-27",
    items: [{ idProduct: 3, quantity: 1 }],
    from: "22060030",
    to: "88015600",
  };
  const output = await checkout.execute(input);
  expect(output.freight).toBe(10);
  expect(output.total).toBe(40);
});

test("Deve criar um pedido com 1 produto em dólar usando um fake", async function () {
  const currencyGateway: CurrencyGateway = {
    async getCurrencies(): Promise<any> {
      return {
        usd: 3,
      };
    },
  };
  const productRepository: ProductRepository = {
    async getProduct(idProduct: number): Promise<any> {
      return {
        idProduct: 6,
        description: "A",
        price: 1000,
        width: 10,
        height: 10,
        length: 10,
        weight: 10,
        currency: "USD",
      };
    },
  };
  checkout = new Checkout(currencyGateway, productRepository);
  const input = {
    cpf: "407.302.170-27",
    items: [{ idProduct: 6, quantity: 1 }],
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(3000);
});

test("Deve gerar o número de série do pedido", async () => {
  const input = {
    cpf: "407.302.170-27",
    items: [{ idProduct: 1, quantity: 3 }],
    from: "22060030",
    to: "88015600",
  };
  const output = await checkout.execute(input);
  expect(output.orderId.length).not.toEqual(0);
});

test.skip("Deve fazer um pedido, salvando no banco de dados", async () => {
  const input = {
    cpf: "407.302.170-27",
    items: [{ idProduct: 1, quantity: 3 }],
    from: "22060030",
    to: "88015600",
  };
  const output = await checkout.execute(input);
  const orderRepository = new OrderRepository();
  console.log(output);
  const order = await orderRepository.getOrder(output.orderId);
  expect(order.orderId).toBe(output.orderId);
});

test.skip("Deve simular o frete, retornando o frete previsto para o pedido", async () => {
  const output = await axios.get("http://localhost:3000/freight-calculator", {
    params: {
      productId: 1,
    },
  });
  const productRepository = new ProductRepository();
  const product = await productRepository.getProduct(1);
  const freight = FreightCalculator.calculate(product);
  expect(output.data).toBe(freight);
});

test.skip("Deve validar o cupom de desconto, indicando em um boolean se o cupom é válido", async () => {
  const input = {
    cpf: "407.302.170-27",
    items: [{ idProduct: 1, quantity: 3 }],
    from: "22060030",
    to: "88015600",
    coupon: "asdsad",
  };
  expect(() => checkout.execute(input)).rejects.toThrow(
    new Error("Invalid coupon")
  );
});
