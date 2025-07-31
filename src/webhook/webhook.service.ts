import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { db } from '../db/client';
import { customerAddresses, customers, orders } from '../db/schema';

@Injectable()
export class WebhookService {
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
    const customer = payload.customer;
  
    await db.insert(customers).values({
      id: customer.id.toString(),
      email: customer.email,
      phone: customer.phone,
      state: customer.state,
      currency: customer.currency,
      firstName: customer.first_name,
      lastName: customer.last_name,
      verifiedEmail: customer.verified_email?.toString(),
      createdAt: new Date(customer.created_at),
      updatedAt: new Date(customer.updated_at),
      taxExempt: customer.tax_exempt?.toString(), 
      adminGraphqlApiId: customer.admin_graphql_api_id,
    }).onConflictDoNothing();
  
    const addr = customer.default_address;
    if (addr) {
      await db.insert(customerAddresses).values({
        id: addr.id.toString(),
        customerId: customer.id.toString(),
        name: addr.name,
        phone: addr.phone,
        company: addr.company,
        address1: addr.address1,
        address2: addr.address2,
        city: addr.city,
        province: addr.province,
        country: addr.country,
        countryCode: addr.country_code,
        provinceCode: addr.province_code,
        zip: addr.zip,
        isDefault: addr.default?.toString(),
      }).onConflictDoNothing();
    }
  
    await db.insert(orders).values({
      shop,
      orderId: payload.id.toString(),
      email: payload.email,
      totalPrice: payload.total_price,
      customerId: customer.id.toString(),
    });
  }  
  
}
