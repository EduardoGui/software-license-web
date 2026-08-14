import { formatDate } from '@angular/common';
import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

@Pipe({ name: 'dataBr' })
export class DataBrPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: string | null | undefined, vazio = '-'): string {
    if (!value) {
      return vazio;
    }

    return formatDate(value, 'dd/MM/yyyy', this.locale);
  }
}
