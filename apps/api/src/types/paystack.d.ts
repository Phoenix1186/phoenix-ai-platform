declare module '@paystack/paystack-sdk' {
  export class Paystack {
    constructor(secretKey: string);
    transaction: {
      initialize(params: any): Promise<any>;
      verify(reference: string): Promise<any>;
    };
    miscellaneous: {
      getBanks(params: any): Promise<any>;
    };
  }
}
