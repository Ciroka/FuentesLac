import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSalesDetailDto } from './create-sales-detail.dto';

describe('CreateSalesDetailDto', () => {
  it('accepts unitPrice sent as a numeric string, coercing it to a number', async () => {
    const dto = plainToInstance(CreateSalesDetailDto, {
      quantity: 2,
      batchId: 1,
      unitPrice: '150.50',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.unitPrice).toBe(150.5);
  });

  it('still rejects a negative unitPrice', async () => {
    const dto = plainToInstance(CreateSalesDetailDto, {
      quantity: 2,
      batchId: 1,
      unitPrice: '-10',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('unitPrice');
  });
});
