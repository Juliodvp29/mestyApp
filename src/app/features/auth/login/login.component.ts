import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonList,
  IonText,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonList,
    IonText,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {}
