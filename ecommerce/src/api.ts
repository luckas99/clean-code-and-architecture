import express, { Request, Response } from "express";
import Checkout from "./checkout";
import FreightCalculator from "./checkout/freight-calculator";
import ProductRepository from "./repositories/product/product-repository.interface";

const app = express();
const port = 3000;

app.post("/checkout", async (req: Request, res: Response) => {
  try {
    const checkout = new Checkout();
    const output = checkout.execute(req.body);
    res.json(output);
  } catch (err: any) {
    res.status(422).json({
      message: err.message,
    });
  }
});

app.get("/currencies", async function (req: Request, res: Response) {
  res.json({
    usd: 3 + Math.random(),
  });
});

app.get("/freight-calculator", async function (req: Request, res: Response) {
  try {
    if (!req.query.productId) throw new Error("Missing arguments [ProductId]");
    const productRepository = new ProductRepository();
    const productId = parseInt(req.query.productId as any);
    const product = await productRepository.getProduct(productId);
    const freight = FreightCalculator.calculate(product);
    res.json(freight);
  } catch (err: any) {
    res.status(422).json({
      message: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
