import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { WeatherType, Country, WeatherEventRequest, WeatherEventSearchRequest, KeyValueObject, WeatherEvent } from '../dtos/dtos'; 
import { ActivatedRoute } from '@angular/router';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public token: string = '';
  private readonly userNameSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  userName$ = this.userNameSubject.asObservable();  // Expose it as an observable
  userName: string = "";

  private readonly notesIconFlagSource = new BehaviorSubject<boolean>(false);
  currentFlag = this.notesIconFlagSource.asObservable();

  private readonly appointmentsIconFlagSource = new BehaviorSubject<boolean>(false);
  currentAppointmentsFlag = this.appointmentsIconFlagSource.asObservable();

  private readonly claimantIdSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  claimantIdSubject$ = this.claimantIdSubject.asObservable();  // Expose it as an observable
  claimantId: number = 0;

  private readonly caseIdSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  caseIdSubject$ = this.caseIdSubject.asObservable();  // Expose it as an observable
  caseId: number = 0;


  constructor(private readonly http: HttpClient, private readonly route: ActivatedRoute) {
    this.route.queryParams.subscribe((params: any) => {
      
      let usernameParams = params["userName"] ?? params["UserName"];

      if (params && usernameParams !== null && usernameParams !== undefined) {
        
        sessionStorage.setItem("userName", usernameParams);
        this.userName = usernameParams;
        this.userNameSubject.next(usernameParams);
      }
      else if (!params || usernameParams === null || usernameParams === undefined) {
        this.userName = sessionStorage.getItem("userName") ?? "";
        this.userNameSubject.next(this.userName);
      }

      let _claimantId = params["claimantid"] ?? params["claimantId"];

      if (params && _claimantId !== null && _claimantId !== undefined) {
        sessionStorage.setItem("claimantId", _claimantId);
        this.claimantId = _claimantId;
        this.claimantIdSubject.next(this.claimantId);
      }
      else if (!params || _claimantId === null || _claimantId === undefined) {
        this.claimantId = Number(sessionStorage.getItem("claimantId"));
        this.claimantIdSubject.next(this.claimantId);
      }

      let _caseId = params["caseid"] ?? params["caseId"];

      if (params && _caseId !== null && _caseId !== undefined) {
        sessionStorage.setItem("caseId", _caseId);
        this.caseId = _caseId;
        this.caseIdSubject.next(this.caseId);
      }
      else if (!params || _caseId === null || _caseId === undefined) {
        this.caseId = Number(sessionStorage.getItem("caseId"));
        this.caseIdSubject.next(this.caseId);
      }
    });   
  }

  changeFlag(flag: boolean) {
    this.notesIconFlagSource.next(flag);
  }
  changeAppointmentsFlag(flag: boolean) {
    this.appointmentsIconFlagSource.next(flag);
  }

  getReferrerUrl(): string {
   return document.referrer;
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('X-Api-Key', sessionStorage.getItem("token") ?? this.token);  
  }

  //API Call for getting all weather events
  getallWeatherEvents(countryCode: KeyValueObject[] | null = null, reasonCode: any | null = null, startDate: any | null = null, endDate: any | null = null, location: any | null = null, status: boolean | false = false,
    states: KeyValueObject[] | null = null): Observable<WeatherEvent[]> {
    let stringArrayStates: string[] = [];
    if (states?.length !== 0 && states !== undefined) {
      states?.forEach(element => {
        stringArrayStates.push(element.key);
      });
    }

    let stringArrayCountries: string[] = [];
    if (countryCode?.length !== 0 && countryCode !== undefined) {
      countryCode?.forEach(element => {
        stringArrayCountries.push(element.key);
      });
    }

    let body: WeatherEventSearchRequest = {
      reasonCode: reasonCode,
      countries: stringArrayCountries,
      states: stringArrayStates,
      location: location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: status
    };     
    return this.http.post<WeatherEvent[]>('/api/WeatherAlerts/Search', body, { headers: this.getHeaders() });

  };


  // API Call for getting all Countries
  getallCountries(): Observable<Country[]> {
    return this.http.get<Country[]>('/api/ReferenceData/Countries', { headers: this.getHeaders() });
  };

  // API Call for getting all US States
  getUsStates(): Observable<Country[]> {
    return this.http.get<any[]>('/api/ReferenceData/USStates', { headers: this.getHeaders() });
  };

  // API Call for getting all weather types
  getAllWeatherTypes(): Observable<WeatherType[]> {
    return this.http.get<WeatherType[]>('/api/ReferenceData/WeatherTypes', { headers: this.getHeaders() });
  };

  // API Call for getting weather event by ID
  getWeatherEvent(id: any) {     
    let paramList = new HttpParams().set('ID', id);
    return this.http.get('api/WeatherAlerts', { params: paramList, headers: this.getHeaders() });
  }

  // API Call for getting weather event by ID
  getUserAuthorization(userName: string) {     
    let paramList = new HttpParams().set('userName', userName);
    return this.http.get<string[]>('api/Authorization/UserAuthorization', { params: paramList, headers: this.getHeaders() });
  }

  // API Call for saving weather event
  addWeatherEvent(request: WeatherEventRequest): Observable<any> {
    const body = {
      weather_Event_Id: request.WeatherAlertID ?? 0,
      vA_WeatherEvent_Code: request.vaCode,
      name: request.weatherAlertName,
      weather_Reason_Code: request.weatherType,
      reason: request.otherReason ?? null,
      location: request.location ?? null,
      description: request.description ?? null,
      startDate: new Date(request.startDate).toISOString(),
      endDate: new Date(request.endDate).toISOString(),
      states: request.statesArray ?? null,
      countries: request.countriesArray ?? null,
      userId: this.userName
    };
        
    return this.http.post('/api/WeatherAlerts/Save', body, { headers: this.getHeaders() });
  }
  
  //API for deleting a weather event
  deleteWeatherAlert(id: any) { 

    let paramList = new HttpParams()
      .set('eventId', id)
    .set('userId', this.userName);    
    return this.http.delete('/api/WeatherAlerts/Delete', { params: paramList, headers: this.getHeaders() });
  }

  setUserName(userName: string): void {
    this.userNameSubject.next(userName);
  }
}
