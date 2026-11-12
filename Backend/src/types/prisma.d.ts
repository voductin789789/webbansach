declare module '@prisma/client' {
  export class PrismaClient {
    constructor(options?: any);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
    user: any;
    category: any;
    book: any;
    cart: any;
    cartItem: any;
    order: any;
    orderItem: any;
    review: any;
  }
}

