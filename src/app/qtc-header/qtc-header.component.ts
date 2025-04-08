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
   this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;

        // Example logic for determining claimantLevel
        if (url.includes('/admin')) {
          this.claimantLevel = 'Admin';
        } else if (url.includes('/provider')) {
          this.claimantLevel = 'Provider';
        } else if (url.includes('/user')) {
          this.claimantLevel = 'User';
        } else {
          this.claimantLevel = 'Guest';
        }
      });
  }
  }
}
