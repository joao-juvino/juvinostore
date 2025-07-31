import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhooks/orders')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('create')
  async handleOrderCreate(@Req() req: Request, @Res() res: Response) {
    const shop = req.headers['x-shopify-shop-domain'] as string;

    if (!this.webhookService.validateWebhook(req)) {
      console.warn('Webhook inválido');
      return res.status(HttpStatus.UNAUTHORIZED).send('Invalid HMAC');
    }

    await this.webhookService.saveOrder(shop, req.body);
    return res.status(HttpStatus.OK).send('Pedido salvo com sucesso');
  }
}
