import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'app-otp-input',
  templateUrl: './otp-input.component.html',
  styleUrls: ['./otp-input.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpInputComponent implements OnInit {
  @ViewChildren('otpBox') boxes!: QueryList<ElementRef<HTMLInputElement>>;

  readonly codeChange = output<string>();
  readonly codeComplete = output<string>();

  readonly digits = signal<string[]>(['', '', '', '', '', '']);
  readonly hasError = signal(false);

  ngOnInit(): void {}

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    input.value = val;

    const updated = [...this.digits()];
    updated[index] = val;
    this.digits.set(updated);

    const full = updated.join('');
    this.codeChange.emit(full);

    if (val && index < 5) {
      this.focusBox(index + 1);
    }

    if (full.length === 6) {
      this.codeComplete.emit(full);
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const updated = [...this.digits()];
      if (updated[index]) {
        updated[index] = '';
        this.digits.set(updated);
        this.codeChange.emit(updated.join(''));
      } else if (index > 0) {
        updated[index - 1] = '';
        this.digits.set(updated);
        this.codeChange.emit(updated.join(''));
        this.focusBox(index - 1);
      }
      event.preventDefault();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      this.focusBox(index - 1);
    }
    if (event.key === 'ArrowRight' && index < 5) {
      this.focusBox(index + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const cleaned = text.replace(/\D/g, '').slice(0, 6);
    if (!cleaned) return;

    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < cleaned.length; i++) {
      updated[i] = cleaned[i];
    }
    this.digits.set(updated);

    const boxArr = this.boxes.toArray();
    boxArr.forEach((b, i) => (b.nativeElement.value = updated[i]));

    const full = updated.join('');
    this.codeChange.emit(full);
    if (full.length === 6) {
      this.codeComplete.emit(full);
      this.focusBox(5);
    } else {
      this.focusBox(cleaned.length < 6 ? cleaned.length : 5);
    }
  }

  shakeError(): void {
    this.hasError.set(true);
    setTimeout(() => this.hasError.set(false), 600);
  }

  getValue(): string {
    return this.digits().join('');
  }

  reset(): void {
    this.digits.set(['', '', '', '', '', '']);
    this.boxes.toArray().forEach((b) => (b.nativeElement.value = ''));
    this.focusBox(0);
  }

  private focusBox(index: number): void {
    const box = this.boxes.toArray()[index];
    if (box) {
      box.nativeElement.focus();
      box.nativeElement.select();
    }
  }
}
