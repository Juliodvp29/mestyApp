import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'messageTime', standalone: true })
export class MessageTimePipe implements PipeTransform {
  transform(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
