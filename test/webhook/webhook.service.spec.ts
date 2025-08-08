import { WebhookService } from '../../src/webhook/webhook.service';
import * as crypto from 'crypto';

describe('WebhookService', () => {
    let webhookService: WebhookService;

    const mockOrdersService = {
        saveOrder: jest.fn(),
    };

    beforeEach(() => {
        process.env.SHOPIFY_API_SECRET = 'test-secret';

        webhookService = new WebhookService(mockOrdersService as any);
    });

    it('should validate a valid HMAC', () => {
        const rawBody = Buffer.from(JSON.stringify({ test: 'data' }));
        const digest = crypto
            .createHmac('sha256', 'test-secret')
            .update(rawBody)
            .digest('base64');

        const mockRequest = {
            headers: {
                'x-shopify-hmac-sha256': digest,
            },
            rawBody,
        } as any;

        const isValid = webhookService.validateWebhook(mockRequest);
        expect(isValid).toBe(true);
    });

    it('should invalidate an invalid HMAC', () => {
        const rawBody = Buffer.from(JSON.stringify({ test: 'data' }));

        const mockRequest = {
            headers: {
                'x-shopify-hmac-sha256': 'invalid-hmac',
            },
            rawBody,
        } as any;

        const isValid = webhookService.validateWebhook(mockRequest);
        expect(isValid).toBe(false);
    });
});
