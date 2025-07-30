import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

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
    console.log(data);
  }
}
