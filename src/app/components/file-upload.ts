import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss'
})
export class FileUpload {
  files: File[] = [];
  previews: string[] = [];
  uploadProgress: number[] = [];
  errorMessages: string[] = [];
  uploading = false;

  constructor(private http: HttpClient) { }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  handleFiles(selectedFiles: File[]) {
    this.files = [];
    this.previews = [];
    this.errorMessages = [];

    selectedFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        this.errorMessages.push(`${file.name} is not an image.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        this.errorMessages.push(`${file.name} exceeds 5MB limit.`);
        return;
      }

      this.files.push(file);

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.previews.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  uploadFiles() {
    this.uploading = true;
    this.uploadProgress = [];

    this.files.forEach((file, index) => {
      const formData = new FormData();
      formData.append('file', file);

      this.http.post('http://localhost:3000/upload', formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress[index] = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            console.log('Upload complete:', event.body);
          }
        }, error: error => {
          console.error('Upload error:', error);
          this.uploadProgress[index] = 0;
        }
      });
    });
  }
}
