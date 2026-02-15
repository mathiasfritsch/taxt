import { Component, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Document {
  id: number;
  name: string;
}

@Component({
  selector: 'app-documents',
  imports: [CommonModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class DocumentsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly documents = signal<Document[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading.set(true);
    this.error.set(null);
    
    this.http.get<Document[]>('/api/documents')
      .subscribe({
        next: (data) => {
          this.documents.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load documents: ' + err.message);
          this.loading.set(false);
        }
      });
  }
}
