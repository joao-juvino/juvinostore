import { Module } from '@nestjs/common';
import { ShopifyController } from './shopify/shopify.controller';
import { ShopifyService } from './shopify/shopify.service';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';

@Module({
  imports: [],
  controllers: [ShopifyController, WebhookController],
  providers: [ShopifyService, WebhookService],
})
export class AppModule {}
