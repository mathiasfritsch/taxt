import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocumentsComponent } from './documents';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DocumentsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('your documents');
}
