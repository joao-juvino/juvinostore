import { Module } from '@nestjs/common';
import { ShopifyController } from './shopify/shopify.controller';
import { ShopifyService } from './shopify/shopify.service';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';

@Module({
  imports: [],
  controllers: [ShopifyController, WebhookController, OrdersController],
  providers: [ShopifyService, WebhookService, OrdersService],
})
export class AppModule {}
