import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  private readonly el = inject(ElementRef);

  @Input() appHighlight = '';
  @Input() defaultColor = 'transparent';

  @HostListener('mouseenter') onMouseEnter(): void {
    this.highlight(this.appHighlight || 'var(--mat-sys-surface-container-high)');
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.highlight(this.defaultColor);
  }

  private highlight(color: string): void {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
