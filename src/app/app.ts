import { Component } from '@angular/core';
import { FileUpload } from './components/file-upload';

@Component({
  selector: 'app-root',
  imports: [FileUpload],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'angular-file-upload';
}
