import inquirer from "inquirer";
import { Product } from "./business/order/types/order.type";

const prompt = inquirer.createPromptModule();

const questions = [
  {
    type: "input",
    name: "description",
    message: "What's product description?",
  },
  {
    type: "number",
    name: "quantity",
    message: "How many products do you want to register?",
  },
  {
    type: "number",
    name: "price",
    message: "How much it costs?",
  },
  {
    type: "confirm",
    name: "isFinished",
    message: "Are you done?",
  },
];

const products: Product[] = [];

// @ts-ignore
(function getAnswers() {
  return prompt(questions).then((answers: any) => {
    if (!Number(answers.price) || !Number(answers.quantity)) {
      return console.log("Quantity or price are invalid");
    }

    products.push({
      description: answers.description,
      price: answers.price,
      quantity: answers.quantity,
    });

    if (answers.isFinished) {
      return console.log(products);
    }

    return getAnswers();
  });
})();
