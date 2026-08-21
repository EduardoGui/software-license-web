import { Component, Input } from '@angular/core';

export type IconName =
  | 'eye'
  | 'pencil'
  | 'ban'
  | 'check-circle'
  | 'arrow-left'
  | 'plus'
  | 'check'
  | 'x'
  | 'log-out'
  | 'menu'
  | 'paperclip'
  | 'download'
  | 'trash'
  | 'mail';

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
        @case ('log-out') {
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        }
        @case ('menu') {
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        }
        @case ('paperclip') {
          <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        }
        @case ('download') {
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5 5 5-5" />
          <path d="M12 15V3" />
        }
        @case ('trash') {
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        }
        @case ('mail') {
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 6-10 7L2 6" />
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
