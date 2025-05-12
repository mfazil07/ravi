import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CaseWithAppointment, CaseDetails,SaveImpactedAlertsRequest, KeyValueObject, CaseWeatherEventSearchRequest } from '../dtos/dtos';

@Injectable({
  providedIn: 'root'
})
export class ClaimantsWeatherAlertsService {
  public token: string ='';
  public claimantId:number | undefined;
  public caseId:number | undefined;
  public userId: string | undefined;


  getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('X-Api-Key', sessionStorage.getItem("token") ?? this.token);  
  }
  
  constructor(private readonly http: HttpClient) { }

  //api call for getting the claimant Info
  getClaimantInfo(claimantId:number,caseId:number, isMapped:boolean): Observable<CaseWithAppointment[]>{
    const paramList = new HttpParams()
    .set('claimantid', claimantId)
    .set('caseid', caseId)
    .set('ismapped', isMapped);
    return this.http.get<CaseDetails[]>('/api/CaseAlerts/AccountInfo',{ params: paramList, headers: this.getHeaders()});    
  }

  //api call for getting the grid details
  GetCaseWithAppointments(claimantId:number,caseId:number) : Observable<CaseDetails[]>{
    const paramList = new HttpParams()
    .set('claimantId', claimantId)
    .set('caseId', caseId);
    return this.http.get<CaseDetails[]>('/api/CaseAlerts/ImpactedAppts',{ params: paramList, headers: this.getHeaders()});
    
  }

  //API call for getting case alerts -weather events
  GetUnmappedWeatherEvents(claimantId:number, caseId:number ,startDate: any | null = null,endDate: any | null = null, location: any | null = null, 
    countries: KeyValueObject[] | null = null, states: KeyValueObject[] | null = null,mappedEventsOnly: boolean | false = false) 
  : Observable<CaseDetails[]>{

    let stringArrayStates: string[] = [];
    if (states?.length !== 0 && states !== undefined) {
      states?.forEach(element => {
        stringArrayStates.push(element.key);
      });
    }

    let stringArrayCountries: string[] = [];
    if (countries?.length !== 0 && countries !== undefined) {
      countries?.forEach(element => {
        stringArrayCountries.push(element.key);
      });
    }

    let body: CaseWeatherEventSearchRequest = {
      claimantId: claimantId,
      caseId: caseId,
      countries: stringArrayCountries,
      states: stringArrayStates,
      location: location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      mappedEventsOnly: mappedEventsOnly
    }; 
    return this.http.post<CaseDetails[]>('/api/CaseAlerts/Search', body, { headers: this.getHeaders() });
  }

   // API Call for saving weather event for a case ID
   addCaseWeatherEvent(request: SaveImpactedAlertsRequest): Observable<any> {   
    const body =  request    
    return this.http.post('/api/CaseAlerts/SaveImpactedAlerts',body, { headers: this.getHeaders() });
    
  }

}
