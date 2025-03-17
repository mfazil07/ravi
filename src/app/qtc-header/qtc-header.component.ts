import { Component } from '@angular/core';

@Component({
  selector: 'app-qtc-header',
  templateUrl: './qtc-header.component.html',
  styleUrl: './qtc-header.component.css'
})
export class QtcHeaderComponent {
modalOpen: boolean = false;
  urlToOpen: any= '';

  constructor(private domSanitizer: DomSanitizer) {
    const url = 'https://www.google.com';
    this.urlToOpen = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
