import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { Response } from 'express';

@Controller('auth/shopify')
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  @Get()
  async redirectToShopify(@Query('shop') shop: string, @Res() res: Response) {
    if (!shop) throw new BadRequestException('Shop param is required');
    const url = this.shopifyService.getAuthUrl(shop);
    return res.redirect(url);
  }

  @Get('callback')
  async callback(@Query() query: any, @Res() res: Response) {
    const { shop, code, hmac } = query;
    if (!shop || !code || !hmac)
      throw new BadRequestException('Missing parameters');

    if (!this.shopifyService.verifyHmac(query)) {
      throw new BadRequestException('Invalid HMAC');
    }

    const token = await this.shopifyService.getAccessToken(shop, code);

    await this.shopifyService.storeShop({
      shop,
      accessToken: token,
      connectedAt: new Date(),
    });

    const webhookUrl = process.env.WEBHOOK_ORDERS_CREATE_URL!;
    
    const exists = await this.shopifyService.isWebhookRegistered(shop, token, 'orders/create', webhookUrl);
    if (!exists) {
      await this.shopifyService.registerOrdersCreateWebhook(shop, token, webhookUrl);
    } else {
      console.log("Webhook orders/create já está registrado");
    }

    return res.send('App instalado com sucesso!');
  }

  @Get('webhooks')
  async getWebhooks(@Query('shop') shop: string, @Res() res: Response) {
    if (!shop) throw new BadRequestException('Shop param is required');

    const shopData = await this.shopifyService.getShopFromDB(shop);
    if (!shopData) throw new BadRequestException('Shop not found');

    const webhooks = await this.shopifyService.listWebhooks(shop, shopData.accessToken);
    return res.json(webhooks);
  }

  @Delete('webhooks')
  async removeAllWebhooks(@Query('shop') shop: string, @Res() res: Response) {
    if (!shop) throw new BadRequestException('Shop param is required');

    const shopData = await this.shopifyService.getShopFromDB(shop);
    if (!shopData) throw new BadRequestException('Shop not found');

    await this.shopifyService.deleteAllWebhooks(shop, shopData.accessToken);

    return res.json({ message: 'Todos os webhooks removidos com sucesso' });
  }
}
