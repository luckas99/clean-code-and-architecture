import CouponRepositoryInterface from "./coupon-repository.interface";
import pgp from "pg-promise";

export class CouponRepository implements CouponRepositoryInterface {
  async getCoupon(code: string): Promise<any> {
    const connection = pgp()("postgres://root:root@localhost:5441/root");
    const [couponData] = await connection.query(
      "select * from cccat10.coupon where code = $1",
      [code]
    );
    await connection.$pool.end();
    return couponData;
  }
}
