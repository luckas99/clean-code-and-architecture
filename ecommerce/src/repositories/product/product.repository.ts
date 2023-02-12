export default interface ProductRepositoryInterface {
  getProduct(idProduct: number): Promise<any>;
}
