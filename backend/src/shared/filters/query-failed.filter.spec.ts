import { ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { QueryFailedFilter } from './query-failed.filter';

describe('QueryFailedFilter', () => {
  function makeFilter() {
    const reply = jest.fn();
    const applicationRef = {
      isHeadersSent: jest.fn().mockReturnValue(false),
      reply,
      end: jest.fn(),
    };
    const filter = new QueryFailedFilter(applicationRef as never);
    const host = {
      getArgByIndex: () => ({}),
    } as unknown as ArgumentsHost;
    return { filter, host, reply };
  }

  it('translates a foreign key violation into a 409 Conflict', () => {
    const { filter, host, reply } = makeFilter();
    const error = new QueryFailedError('DELETE ...', [], {
      code: '23503',
    } as unknown as Error);

    filter.catch(error, host);

    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ statusCode: 409 }),
      409,
    );
  });

  it('falls back to the default 500 handling for any other database error, without throwing', () => {
    const { filter, host, reply } = makeFilter();
    const error = new QueryFailedError('SELECT ...', [], {
      code: '42601',
    } as unknown as Error);

    expect(() => filter.catch(error, host)).not.toThrow();
    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ statusCode: 500 }),
      500,
    );
  });
});
