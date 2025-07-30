import { Module } from '@nestjs/common';
import { ShopifyController } from './shopify/shopify.controller';
import { ShopifyService } from './shopify/shopify.service';

@Module({
  imports: [],
  controllers: [ShopifyController],
  providers: [ShopifyService],
})
export class AppModule {}
