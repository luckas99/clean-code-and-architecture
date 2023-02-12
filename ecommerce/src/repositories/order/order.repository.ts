import OrderRepositoryInterface from "./order-repository.interface";
import pgp from "pg-promise";

export interface OrderDTO {
  orderId: string;
  price: number;
  cepFrom: string;
  cepTo: string;
}

export default class OrderRepository implements OrderRepositoryInterface {
  async getOrder(orderId: string): Promise<OrderDTO> {
    const connection = pgp()("postgres://root:root@localhost:5441/root");
    const [orderData] = await connection.query(
      "select * from cccat10.order where order_id = $1",
      [orderId]
    );
    await connection.$pool.end();
    return {
      orderId: orderData.order_id,
      cepFrom: orderData.cep_from,
      cepTo: orderData.cep_to,
      price: orderData.price,
    };
  }

  async save(data: OrderDTO) {
    const connection = pgp()("postgres://root:root@localhost:5441/root");
    const [orderData] = await connection.query(
      "insert into cccat10.order(order_id, price, cep_from, cep_to) values ($1, $2, $3, $4)",
      [data.orderId, data.price, data.cepFrom, data.cepTo]
    );
    await connection.$pool.end();
    return orderData;
  }
}
