import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

const GENERIC_MESSAGE = 'Este valor no es válido';

/**
 * Orden de prioridad cuando un control tiene más de un error activo a la vez:
 * "obligatorio" siempre debe pisar a los demás, y así sucesivamente.
 */
const MESSAGE_BUILDERS: [string, (error: Record<string, unknown>) => string][] = [
  ['required', () => 'Este campo es obligatorio'],
  ['email', () => 'Ingresá un email válido'],
  ['minlength', (e) => `Tiene que tener al menos ${e['requiredLength']} caracteres`],
  ['maxlength', (e) => `No puede tener más de ${e['requiredLength']} caracteres`],
  ['min', (e) => `El valor no puede ser menor a ${e['min']}`],
  ['max', (e) => `El valor no puede ser mayor a ${e['max']}`],
];

@Pipe({ name: 'formError', standalone: true })
export class FormErrorPipe implements PipeTransform {
  transform(errors: ValidationErrors | null | undefined): string {
    if (!errors) return '';

    for (const [key, buildMessage] of MESSAGE_BUILDERS) {
      if (errors[key]) return buildMessage(errors[key]);
    }

    return GENERIC_MESSAGE;
  }
}
