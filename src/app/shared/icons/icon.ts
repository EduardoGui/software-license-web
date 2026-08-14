import { Component, Input } from '@angular/core';

export type IconName =
  | 'eye'
  | 'pencil'
  | 'ban'
  | 'check-circle'
  | 'arrow-left'
  | 'plus'
  | 'check'
  | 'x';

@Component({
  selector: 'app-icon',
  imports: [],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icone"
      aria-hidden="true"
    >
      @switch (name) {
        @case ('eye') {
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
          <circle cx="12" cy="12" r="3" />
        }
        @case ('pencil') {
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        }
        @case ('ban') {
          <circle cx="12" cy="12" r="9" />
          <path d="M5.5 5.5l13 13" />
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 5-5" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5" />
          <path d="M11 18l-6-6 6-6" />
        }
        @case ('plus') {
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        }
        @case ('check') {
          <path d="m4 12 5 5 11-11" />
        }
        @case ('x') {
          <path d="M18 6 6 18" />
          <path d="M6 6l12 12" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
  `,
})
export class Icon {
  @Input() name!: IconName;
  @Input() size = 16;
}
