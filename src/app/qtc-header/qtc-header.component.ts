import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-qtc-header',
  templateUrl: './qtc-header.component.html',
  styleUrl: './qtc-header.component.scss'
})
export class QtcHeaderComponent implements OnInit {

  userName: string = '';
  claimantId: number = 0;
  caseId: number = 1;
  notesRequired: boolean = false;
  urlToOpen: any = '';
  externalUrl: string = ''
  appointmentsIconRequired: boolean = false;
  claimantLevel:string = 'CASE LEVEL';

  constructor(private readonly commonService: CommonService,
    private readonly router: Router,
  ) {   
    debugger;
      
  
}

  

  ngOnInit() {
    this.commonService.userName$.subscribe(userName => {
      this.userName = userName;
    });

    this.commonService.currentFlag.subscribe(flag => {
      this.notesRequired = flag;
    });

    this.commonService.currentAppointmentsFlag.subscribe(appointmentsflag => {
      debugger;
      this.appointmentsIconRequired = appointmentsflag;
     
    });

    this.commonService.claimantIdSubject$.subscribe(claimantId => {
      this.claimantId = claimantId;
    });

    this.commonService.caseIdSubject$.subscribe(caseId => {
      this.caseId = caseId;
    });

     this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects;

      if (currentUrl.includes('/admin')) {
        this.claimantLevel = 'ADMIN LEVEL';
      } else if (currentUrl.includes('/provider')) {
        this.claimantLevel = 'PROVIDER LEVEL';
      } else if (currentUrl.includes('/case')) {
        this.claimantLevel = 'CASE LEVEL';
      } else {
        this.claimantLevel = 'DEFAULT LEVEL';
      }
    });

    this.externalUrl = this.commonService.getReferrerUrl();
  }

  openNotesWindow() {
    let notesUrl = this.externalUrl + 'notes/Q_NOTES_01.asp?claimant_Id=' + this.claimantId + '&case_Id=' + this.caseId;
    window.open(notesUrl, 'Notes', 'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=100, width=900, height=800');
  }

  openAppointmentsWindow() {
    debugger;
    const url = this.router.serializeUrl(this.router.createUrlTree(['withAppointment'], {
      queryParams: {
        claimantId: this.claimantId,
        caseid: this.caseId
      }
    }));
    
     
    
    const fullUrl = `${window.location.origin}${url}`;
    console.log(fullUrl);
    window.open(fullUrl, '_blank');  

  }

}
