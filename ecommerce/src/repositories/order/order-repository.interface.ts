import { OrderDTO } from "./order.repository";

export default interface OrderRepositoryInterface {
  getOrder(orderId: string): Promise<OrderDTO>;
  save(input: OrderDTO): Promise<OrderDTO>;
}
