import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(@Res() res: Response) {
    const orders = await this.ordersService.getOrdersWithDetails();
    return res.json(orders);
  }
}
