import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { db } from '../db/client';
import { shops } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ShopifyService {
  private readonly apiKey = process.env.SHOPIFY_API_KEY!;
  private readonly apiSecret = process.env.SHOPIFY_API_SECRET!;
  private readonly scopes = process.env.SHOPIFY_SCOPES || 'read_products';
  private readonly redirectUri = process.env.SHOPIFY_REDIRECT_URI!;

  getAuthUrl(shop: string): string {
    const scopes = encodeURIComponent(this.scopes);
    const redirect = encodeURIComponent(this.redirectUri);
    return `https://${shop}/admin/oauth/authorize?client_id=${this.apiKey}&scope=${scopes}&redirect_uri=${redirect}`;
  }

  verifyHmac(query: any): boolean {
    const { hmac, ...rest } = query;

    const message = Object.keys(rest)
      .sort()
      .map((key) => `${key}=${rest[key]}`)
      .join('&');

    const hash = crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');

    return hash === hmac;
  }

  async getAccessToken(shop: string, code: string): Promise<string> {
    const response = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: this.apiKey,
        client_secret: this.apiSecret,
        code,
      },
    );

    return response.data.access_token;
  }

  async storeShop(data: {
    shop: string;
    accessToken: string;
    connectedAt: Date;
  }) {
    await db
      .insert(shops)
      .values({
        shop: data.shop,
        accessToken: data.accessToken,
        connectedAt: data.connectedAt,
      })
      .onConflictDoUpdate({
        target: shops.shop, // campo que causa conflito (chave primária ou unique)
        set: {
          accessToken: data.accessToken,
          connectedAt: data.connectedAt,
        },
      });

  }

  async registerOrdersCreateWebhook(shop: string, accessToken: string, webhookUrl: string) {
    try {
      const response = await axios.post(
        `https://${shop}/admin/api/2023-07/webhooks.json`,
        {
          webhook: {
            topic: 'orders/create',
            address: webhookUrl,
            format: 'json',
          },
        },
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error('Erro ao registrar webhook:', error.response?.data || error.message);
      throw error;
    }
  }

  async isWebhookRegistered(shop: string, accessToken: string, topic: string, address: string) {
    const response = await axios.get(`https://${shop}/admin/api/2023-07/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });
    return response.data.webhooks.some(
      (w: any) => w.topic === topic && w.address === address
    );
  }

  async listWebhooks(shop: string, accessToken: string) {
    const response = await axios.get(`https://${shop}/admin/api/2023-07/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });
    return response.data.webhooks;
  }

  async deleteWebhook(shop: string, accessToken: string, webhookId: number) {
    await axios.delete(`https://${shop}/admin/api/2023-07/webhooks/${webhookId}.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });
  }

  async deleteAllWebhooks(shop: string, accessToken: string) {
    const webhooks = await this.listWebhooks(shop, accessToken);
    for (const webhook of webhooks) {
      await this.deleteWebhook(shop, accessToken, webhook.id);
    }
  }

  async getShopFromDB(shop: string) {
    const result = await db
      .select()
      .from(shops)
      .where(eq(shops.shop, shop))
      .limit(1);
    
    return result[0];
  }
  
}
