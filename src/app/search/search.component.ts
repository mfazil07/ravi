import { Component, OnInit } from '@angular/core';
import { CaseDetails, ImpactedAlerts, KeyValueObject, SaveImpactedAlertsRequest } from '../dtos/dtos';
import { SearchForm, NotificationWeatherEvent } from '../models/notification';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService, IAlertType } from '../services/alert.service';
import { ClaimantsWeatherAlertsService } from '../services/claimants-weather-alerts.service';
import { CommonService } from '../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate, Location } from '@angular/common';

@Component({
  selector: 'notification-search',
  templateUrl: './notification-search.component.html',
  styleUrl: './notification-search.component.css'
})
export class NotificationSearchComponent implements OnInit {

  constructor(private readonly claimantsWeatherAlertsService: ClaimantsWeatherAlertsService,
    private readonly commonService: CommonService,
    private readonly alertService: AlertService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location
  ) { }
  claimantId: number = 1;
  caseDetails: CaseDetails = {};
  caseId: number = 1;
  userName: string = '';
  userAccess: string[] = [];
  loading = true;
  isUserAuthorized = true;
  saveImpactedAlertsRequest = {} as SaveImpactedAlertsRequest;
  impactedAlerts: ImpactedAlerts[] = [];
  apiResponse: any;
  selectedEvents: NotificationWeatherEvent[] = [];
  buttonStatus: boolean = false;
  datagridStateChangeCounter: number = 0;
  redirected = false; // Flag to track redirection
  enableMapping: boolean = false;
  mappingSelected: boolean = false;
  disableSelectChange: boolean = false;
  weatherEventsMapped: Array<NotificationWeatherEvent> = []
  triggerRefresh = false;
  claimantCountry:KeyValueObject[] =[];
  claimantState:KeyValueObject[] =[]; 
  countries: KeyValueObject[] =[]; 

  ngOnInit(): void {  
    this.route.queryParams.subscribe((params: any) => {

      let _username = params["userName"] ?? params["UserName"];
      if (params && _username !== null && _username !== undefined) {
        sessionStorage.setItem("userName", _username);
        this.userName = _username;
      }
      else if (!params || _username === null || _username === undefined) {
        this.userName = sessionStorage.getItem("userName") ?? "";
      }
      else {
        this.commonService.changeFlag(false);
        this.commonService.changeAppointmentsFlag(false);
        this.router.navigate(['notAuthorized']);        
      }

      // token access from url
      if (params && params['token'] !== null && params['token'] !== undefined) {
        sessionStorage.setItem("token", params['token'].toString());
        this.commonService.token = params['token'].toString();
      }

      if (!params || params['token'] === null || params['token'] === undefined) {
        this.claimantId = Number(sessionStorage.getItem("claimantId"));
        this.caseId = Number(sessionStorage.getItem("caseId"));
        this.claimantsWeatherAlertsService.token = sessionStorage.getItem("token") ?? "";
        this.userName = sessionStorage.getItem("userName") ?? "";
      }
 
      this.commonService.getUserAuthorization(this.userName).subscribe({
        next: (data) => {
          this.userAccess = data
          if (!(this.userAccess.includes('READ'))) {
            this.commonService.changeFlag(false);
            this.commonService.changeAppointmentsFlag(false);
            this.router.navigate(['notAuthorized']);               
            this.loading = false;
            this.isUserAuthorized = false;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.commonService.changeFlag(false);
          this.commonService.changeAppointmentsFlag(false);
          this.router.navigate(['notAuthorized']);     
          this.loading = false;
          this.isUserAuthorized = false;
        }
      });
    });

    this.route.queryParams.subscribe((params: any) => {

      let _claimantId = params["claimantid"] ?? params["claimantId"];

      if (params && _claimantId !== null && _claimantId !== undefined) {
        sessionStorage.setItem("claimantId", _claimantId);
        this.claimantId = _claimantId;
      }
      else if (!params || _claimantId === null || _claimantId === undefined) {
        this.claimantId = Number(sessionStorage.getItem("claimantId"));
      }

      let _caseId = params["caseid"] ?? params["caseId"];

      if (params && _caseId !== null && _caseId !== undefined) {
        sessionStorage.setItem("caseId", _caseId);
        this.caseId = _caseId;
      }
      else if (!params || _caseId === null || _caseId === undefined) {
        this.caseId = Number(sessionStorage.getItem("caseId"));
      }      

      if(this.caseId > 0  && this.claimantId > 0)
        this.commonService.changeFlag(true);
    });

    //for getting claimant info
    this.claimantsWeatherAlertsService.getClaimantInfo(this.claimantId, this.caseId, false).subscribe({
      next: (result: any) => {
        this.caseDetails = result;
        this.caseDetails.claimant_name = this.caseDetails.lastName + ', ' + this.caseDetails.firstName;
        this.caseDetails.claimantCaseId = this.caseDetails.claimantId + '.' + this.caseDetails.caseId;    
      
        if(this.caseDetails.country != null || this.caseDetails.country != undefined)
          this.claimantCountry.push({key:this.caseDetails.country, value:this.caseDetails.country});

        this.caseDetails.mappedCountries?.forEach((country: string) => {
          const exists = this.claimantCountry.some((item: KeyValueObject) => item.key === country);
          if (!exists) {
            this.claimantCountry.push({ key: country, value: country });
          }
        });

        if( this.claimantCountry?.findIndex(x => x.key.trim() === 'USA') >= 0)
        {
          if((this.caseDetails.state != null || this.caseDetails.state != undefined) && this.caseDetails.country == 'USA' )
            this.claimantState.push({key:this.caseDetails.state, value:this.caseDetails.state});

          this.caseDetails.mappedStates?.forEach((state: string) => {
            const sExists = this.claimantState.some((item: KeyValueObject) => item.key === state);
            if (!sExists) {
              this.claimantState.push({ key: state, value: state });
            }
          });          
        }
        //set changeAppointmentsFlag  to true 
        if (this.caseDetails.hasAppointment && this.isUserAuthorized ) {
          this.commonService.changeAppointmentsFlag(true);    
        }
         
          this.defaultSearch();

      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    }
    );

    this.location.replaceState('search?claimantId=' + this.claimantId + '&caseId=' + this.caseId);    
  }
    
  defaultSearch() {
    this.claimantsWeatherAlertsService.GetUnmappedWeatherEvents(this.claimantId, this.caseId, formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'), formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'), null,this.claimantCountry,this.claimantState, false).subscribe({
      next: (result: any) => {
        this.weatherEvents = result;
        this.handleEnableMapping(false);
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });
  }
  weatherEvents: Array<NotificationWeatherEvent> = []

  notifficationDetails = this.caseDetails;

  searchForm: SearchForm | null = null;

  startDateError = false;
  endDateError = false;

  onSearch(_form: { form: SearchForm, type: string }) {    
    this.disableSelectChange = _form.form.mappedEvents === true;
    switch (_form.type) {
      case 'search':       
        this.handleSearch(_form.form)
        break;
      case 'save':
        this.handleSave(_form.form)
        break;
      case 'reset':
        this.handleReset(_form.form)
        break;
    }
    this.triggerRefresh=false;
  }

  handleUnSelect(unSelectedRow:NotificationWeatherEvent[]) { 
    let selectedItems = unSelectedRow;   
    if (selectedItems === undefined) {      
      this.buttonStatus =false;       
    }else
    {     
      this.buttonStatus =true;
    }
  }

  /**
   *    Triggers when a row is selected in the grid table
   */
  handleSelectionChange(selectedRow: NotificationWeatherEvent[]) {
    
    let weatherEventsState = [];
    weatherEventsState = this.weatherEvents.filter(element => (element.isMapped == 1))

    if (weatherEventsState.length == 0) {
      this.datagridStateChangeCounter++
    }

    this.selectedEvents = selectedRow;


    if (this.selectedEvents.length > 0) {
      this.datagridStateChangeCounter++;
    }

    if (this.selectedEvents.length > 0 && this.datagridStateChangeCounter < 2) {
      this.buttonStatus = false;
      return;
    }

    let weatherEventsStateCheck = [];
    weatherEventsStateCheck = this.weatherEvents;

    this.saveImpactedAlertsRequest.userName = this.userName;
    this.saveImpactedAlertsRequest.claimantId = this.claimantId;
    this.saveImpactedAlertsRequest.caseId = this.caseId;
    this.saveImpactedAlertsRequest.userName = this.userName;

    this.impactedAlerts = [];
    selectedRow.forEach(mappingEventInformation => {

      this.impactedAlerts.push({ weatherMappingId: mappingEventInformation.weatherEventId, isMapped: true });
    });

    for (let item of this.impactedAlerts) {
      const filteredArray = weatherEventsState.filter(element => element.weatherEventId !== item.weatherMappingId)
      weatherEventsState.length = 0;
      weatherEventsState.push(...filteredArray);
    }

    for (let element of weatherEventsState) {
      this.impactedAlerts.push({ weatherMappingId: element.weatherEventId, isMapped: false });
    }

    let eventStatusStateCheck: ImpactedAlerts[] = [];

    for (let item of weatherEventsStateCheck) {

      const isMappedWeatherEventStateCheck: boolean = item.isMapped > 0;
      const filteredArray = this.impactedAlerts.filter(element => element.weatherMappingId === item.weatherEventId && (isMappedWeatherEventStateCheck !== element.isMapped))
      eventStatusStateCheck.push(...filteredArray);
    }

    if (eventStatusStateCheck.length > 0) {
      this.buttonStatus = true;
    }
    else {

      this.buttonStatus = false;
    }

    this.saveImpactedAlertsRequest.impactedAlerts = this.impactedAlerts;
  }

  /**
   *    handle save form event
   */
  handleSave(payload: SearchForm) {

    if (this.saveImpactedAlertsRequest.impactedAlerts?.length > 0) { 

      this.claimantsWeatherAlertsService.addCaseWeatherEvent(this.saveImpactedAlertsRequest).subscribe({
        next: (data) => {
          this.apiResponse = data;
              this.alertService.show({ message: 'Weather event details for the case updated successfully!', clrAlertType: IAlertType.SUCCESS });
              this.buttonStatus = false;
              if (this.saveImpactedAlertsRequest.impactedAlerts.filter(imp => imp.isMapped == true).length === 0) {
                  payload.mappedEvents = false;
                  this.handleReset(payload);
                  window.location.reload();
                  return;
              }
              this.handleSearch(payload);
              window.location.reload();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        },
      });
    }
    else {
      this.alertService.show({ message: 'No changes detected in weather alerts regarding this case.Please check atleast one weather alert!', clrAlertType: IAlertType.WARNING });
    }
  }

  /**
   *    Handle form search event
   */
  handleSearch(payload: any) {
    // Call the api to search the data
    if (payload.mappedEvents) {
      payload.startDatepickrnm = null;
      payload.endDatepickrnm = null;
      payload.location = null;
      payload.frmSrchCountry =[];
      payload.frmSrchState =[];
    }
    
    let countryCode: [KeyValueObject] = payload.frmSrchCountry ?? [];
    let states: [KeyValueObject] =  payload.frmSrchState ?? [];
    let startDate = payload.startDatepickrnm;
    let endDate = payload.endDatepickrnm;
    let location = payload.location;
    let mappedEvents = payload.mappedEvents;

    this.claimantsWeatherAlertsService.GetUnmappedWeatherEvents(this.claimantId, this.caseId, startDate, endDate, location, countryCode,states ,mappedEvents).subscribe({
      next: (result: any) => {
        this.weatherEvents = result;
        this.handleEnableMapping(payload.mappedEvents);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.weatherEvents = []
        }
        this.handleError(error);
      }
    });
  }

  handleEnableMapping(ismappedEvents: boolean): void {    
    let claimantCountry = this.claimantCountry;
    let claimantState = this.claimantState;
    if(ismappedEvents)
    {
      claimantCountry =[];
      claimantState =[];
    }

    this.claimantsWeatherAlertsService.GetUnmappedWeatherEvents(this.claimantId, this.caseId, null, null,null,null, null, true).subscribe({
      next: (result: any) => {
        this.weatherEventsMapped = result;
        const mappedEventList = this.weatherEventsMapped;
        this.enableMapping = mappedEventList.length > 0;
        if (ismappedEvents && this.enableMapping) {
          this.weatherEvents = mappedEventList;
          this.mappingSelected = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.weatherEventsMapped = []
          const mappedEventList = this.weatherEventsMapped;
          this.enableMapping = mappedEventList.length > 0;
          if (ismappedEvents && this.enableMapping) {
            this.weatherEvents = mappedEventList;
            this.mappingSelected = true;
          }
        }         
      }
    });

  }

  handleReset(payload: SearchForm) {
    payload.mappedEvents = false;
    let countryCode: KeyValueObject[] = payload.frmSrchCountry ?? [];
    let states: KeyValueObject[] =  payload.frmSrchState ?? [];
    this.claimantsWeatherAlertsService.GetUnmappedWeatherEvents(this.claimantId, this.caseId, formatDate(new Date(), 'MM/dd/YYYY', 'EN-US'), formatDate(new Date(), 'MM/dd/YYYY', 'EN-US'), '',this.claimantCountry, this.claimantState, false).subscribe({
      next: (result: any) => {
        this.weatherEvents = result;
        this.handleEnableMapping(payload.mappedEvents);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.weatherEvents = []
          this.handleEnableMapping(payload.mappedEvents);
        }
        this.handleError(error);
      }
    });

  }

  handleError(err: HttpErrorResponse) {

    let errMessage = ""

    switch (err.status) {
      case 500:
      case 503:
        errMessage = ' Failed to fetch data from server : contact administrator';
        break;

      case 401:
        errMessage = 'Unauthorized : You are not authorized to perform this action.';
        break;

      case 404:
        errMessage = 'No records found.';
        break;

      default:
        errMessage = err.error;
    }

    this.alertService.show({ message: errMessage, clrAlertType: IAlertType.DANGER });
  }
}
