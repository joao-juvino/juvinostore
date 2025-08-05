import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { db } from '../db/client';
import { customerAddresses, customers, orders } from '../db/schema';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class WebhookService {
  constructor(private readonly orderService: OrdersService) {}
  private readonly apiSecret = process.env.SHOPIFY_API_SECRET!;

  validateWebhook(req: Request): boolean {
    const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;

    const digest = crypto
      .createHmac('sha256', this.apiSecret)
      .update(req.rawBody)
      .digest('base64');

    return digest === hmacHeader;
  }
  async saveOrder(shop: string, payload: any) {
    await this.orderService.saveOrder(shop, payload);
  }

}
