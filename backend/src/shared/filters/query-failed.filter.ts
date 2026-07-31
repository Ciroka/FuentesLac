import { ArgumentsHost, Catch, ConflictException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

const FOREIGN_KEY_VIOLATION = '23503';

/**
 * Sin esto, borrar una fila todavía referenciada por otra (categoría con
 * productos, proveedor con insumos, cliente con ventas) tira un
 * QueryFailedError de Postgres sin atrapar -> 500 genérico en vez de un 409
 * explicando que el recurso está en uso.
 *
 * Extiende BaseExceptionFilter (no solo lanza de nuevo la excepción) porque
 * un `throw` dentro de un ExceptionFilter no cae en el manejo default de
 * Nest: ExceptionsHandler.invokeCustomFilters llama al filtro sin ningún
 * try/catch alrededor, así que un re-throw se propaga como una promesa
 * rechazada sin manejar en RouterProxy (que sí es async) y el request queda
 * colgado en vez de recibir una respuesta. Delegar a `super.catch()`
 * reutiliza el mismo código que ya usa Nest para excepciones no controladas.
 */
@Catch(QueryFailedError)
export class QueryFailedFilter extends BaseExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const code = (exception.driverError as { code?: string })?.code;

    if (code === FOREIGN_KEY_VIOLATION) {
      super.catch(
        new ConflictException(
          'No se puede completar la operación: el recurso está siendo usado por otro registro.',
        ),
        host,
      );
      return;
    }

    super.catch(exception, host);
  }
}
