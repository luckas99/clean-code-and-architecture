import pgp from "pg-promise";
import ProductRepositoryInterface from "./product.repository";

export default class ProductRepository implements ProductRepositoryInterface {
  async getProduct(idProduct: number): Promise<any> {
    const connection = pgp()("postgres://root:root@localhost:5441/root");
    const [productData] = await connection.query(
      "select * from cccat10.product where id_product = $1",
      [idProduct]
    );
    await connection.$pool.end();
    return productData;
  }
}
