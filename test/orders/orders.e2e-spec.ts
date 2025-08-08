import { drizzle } from 'drizzle-orm/node-postgres';
import { pool } from '../../src/db/client';
import * as schema from '../../src/db/schema';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { OrdersService } from '../../src/orders/orders.service';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let service: OrdersService;
  let db: ReturnType<typeof drizzle>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<OrdersService>(OrdersService);
    db = drizzle(pool);
  });

  beforeEach(async () => {
    await db.delete(schema.orders).execute();
    await db.delete(schema.customerAddresses).execute();
    await db.delete(schema.customers).execute();
    await db.delete(schema.shops).execute();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('GET /orders - deve retornar lista vazia quando não há pedidos', async () => {
    const res = await request(app.getHttpServer()).get('/orders').expect(200);
    expect(res.body).toEqual([]);
  });

  it('GET /orders - deve retornar pedidos quando há dados no banco', async () => {
    await insertFakeData(db);

    const res = await request(app.getHttpServer())
      .get('/orders')
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toMatchObject({
      shop: 'fake-shop.myshopify.com',
      email: 'customer@example.com',
    });
  });

  it('POST saveOrder - deve salvar um pedido com customer e default_address', async () => {
    const fakeOrderPayload = makeFakeOrderPayload();

    await service.saveOrder('minha-loja.myshopify.com', fakeOrderPayload);

    const [customers, addresses, orders] = await Promise.all([
      db.select().from(schema.customers).execute(),
      db.select().from(schema.customerAddresses).execute(),
      db.select().from(schema.orders).execute(),
    ]);

    expect(customers).toHaveLength(1);
    expect(customers[0].firstName).toBe('Maria');

    expect(addresses).toHaveLength(1);
    expect(addresses[0].city).toBe('São Paulo');

    expect(orders).toHaveLength(1);
    expect(orders[0].orderId).toBe('order-123');
    expect(orders[0].shop).toBe('minha-loja.myshopify.com');
  });

  function makeFakeOrderPayload() {
    return {
      id: 'order-123',
      email: 'cliente@teste.com',
      total_price: '150.00',
      customer: {
        id: 'cust-1',
        email: 'cliente@teste.com',
        phone: '999999999',
        state: 'SP',
        currency: 'BRL',
        first_name: 'Maria',
        last_name: 'Souza',
        verified_email: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tax_exempt: false,
        admin_graphql_api_id: 'admin-id-123',
        default_address: {
          id: 'addr-1',
          name: 'Casa',
          phone: '999999999',
          company: 'Empresa',
          address1: 'Rua A',
          address2: 'Apto 2',
          city: 'São Paulo',
          province: 'SP',
          country: 'Brasil',
          country_code: 'BR',
          province_code: 'SP',
          zip: '00000-000',
          default: true,
        },
      },
    };
  }

  async function insertFakeData(db: ReturnType<typeof drizzle>) {
    await db.insert(schema.shops).values({
      shop: 'fake-shop.myshopify.com',
      accessToken: 'fake-token',
      connectedAt: new Date(),
    });

    await db.insert(schema.customers).values({
      id: 'cust-1',
      email: 'customer@example.com',
      phone: '123456789',
      state: 'SP',
      currency: 'BRL',
      firstName: 'João',
      lastName: 'Silva',
      verifiedEmail: 'yes',
      createdAt: new Date(),
      updatedAt: new Date(),
      taxExempt: 'no',
      adminGraphqlApiId: 'admin-1',
    });

    await db.insert(schema.customerAddresses).values({
      id: 'addr-1',
      customerId: 'cust-1',
      name: 'Casa',
      phone: '123456789',
      company: 'Minha Empresa',
      address1: 'Rua A, 123',
      address2: '',
      city: 'Campina Grande',
      province: 'Paraíba',
      country: 'Brasil',
      countryCode: 'BR',
      provinceCode: 'PB',
      zip: '58400-000',
      isDefault: 'true',
    });

    await db.insert(schema.orders).values({
      shop: 'fake-shop.myshopify.com',
      orderId: 'order-1',
      email: 'customer@example.com',
      totalPrice: '100.00',
      customerId: 'cust-1',
      createdAt: new Date(),
    });
  }
});
