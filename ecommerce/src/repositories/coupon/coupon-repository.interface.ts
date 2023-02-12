export default interface CouponRepositoryInterface {
  getCoupon(code: string): Promise<any>;
}
