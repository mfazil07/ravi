import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { WeatherType,WeatherEvent,Country,WeatherEventRequest } from '../dtos/dtos';
import { environment } from '../environments/environnment';
import { Result } from '../models/commonmodels';
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private commonUrl = environment.domainApiUrl; 
  
  constructor(private http :HttpClient) { }
// passing header sample
  getallWeatherEvents():Observable<Result>{
    return this.http.get<Result>( this.commonUrl +'WeatherEvent');
  };
  getallCountries():Observable<Country[]>{
    return this.http.get<Country[]>(this.commonUrl+'Country');
  };

  getAllWeatherTypes(): Observable<WeatherType[]>{
    return this.http.get<WeatherType[]>(this.commonUrl +'WeatherType');
  };

  addWeatherEvent(request:WeatherEventRequest):Observable<Result>{
    return this.http.post<Result>(this.commonUrl +'WeatherEvent',request)
  };

  // Call the api to get the content from the api
  getWeatherEventById(params:string):Observable<Result>{
    return this.http.get<Result>(`${this.commonUrl}WeatherAlerts/GetEventById?WeatherAlertID=${params}`); // add the rest of the url 
  }
}
