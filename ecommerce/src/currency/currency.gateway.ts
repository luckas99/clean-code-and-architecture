import axios from "axios";
import CurrencyGatewayInterface from "./currency-interface";

export default class CurrencyGateway implements CurrencyGatewayInterface {
  async getCurrencies() {
    const response = await axios.get("http://localhost:3000/currencies");
    return response.data;
  }
}
