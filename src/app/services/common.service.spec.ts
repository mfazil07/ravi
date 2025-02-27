import { TestBed } from '@angular/core/testing';
import { CommonService } from './common.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { WeatherEvent, Country,WeatherType, WeatherEventRequest } from '../dtos/dtos';
import { HttpClient, HttpHeaders } from '@angular/common/http';

describe('CommonService', () => {
  let service: CommonService;
  let httpMock: HttpTestingController;
  let postSpy: jasmine.Spy;
  let http: HttpClient;
  const mockResponse = { success: true };
  const mockId = '12345';
  const mockUserName = 'testUser';     

  const activatedRouteMock = {
    queryParams: of({ userName: 'testUser' })
  };

  const mockHeaders = new HttpHeaders()
  .set('Content-Type', 'application/json')
  .set('X-Api-Key', 'Bearer Token');


  beforeEach(() => {
    TestBed.configureTestingModule({ 
      imports: [HttpClientTestingModule],
      providers: [
        CommonService,
        { provide: ActivatedRoute, useValue: activatedRouteMock }, 
      ]});
    service = TestBed.inject(CommonService);
    httpMock = TestBed.inject(HttpTestingController);

    postSpy = jasmine.createSpy().and.returnValue(of({})); // Mocking HttpClient's post method
    http = { post: postSpy } as any; // Mock HttpClient   
    service.userName = 'testUser'; // Mock the username
    
    //spyOn(service, 'getHeaders').and.returnValue(mockHeaders);
  });
  

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set userName from query params', () => {
    service.userName$.subscribe((userName) => {
      expect(userName).toBe('testUser');
    });
  });
  const mockWeatherEventData : WeatherEvent[] = [
    {
      weatherEventId :0,
      weatherEventName : "Test",
      description :"TestDesc",
      country : {countryName:"USA", countryCode : "Name",  key: "key", value: "value"},
      weatherType : { weatherTypeCode: "ACT", weatherName: "Name", key: "key", value: "value"},
      location : "testLoc",
      startDate: new Date ('21-02-2025'),
      endDate:new Date ('22-02-2025'),
      stateList:"stateList",
      countryCode: "USA",
      alertName: "FloodAlert",
      alertType: "Flood",
      weatherAlertID: 123,
      activeBox: "Testactive",
      activeStatus: "Active",
      eventStatus: "Active"  
    }
  ];

  it('should call getallWeatherEvents and return data', () => {    

    service.getallWeatherEvents().subscribe((events) => {
      expect(events).toEqual(mockWeatherEventData);
    });

    const req = httpMock.expectOne('/api/WeatherAlerts/Search');
    expect(req.request.method).toBe('POST');
    req.flush(mockWeatherEventData);
  });


  // Test Case : Test with empty arrays for countryCode and states
  it('should handle empty arrays for countryCode and states', () => {
    const countryCode: any[] = [];
    const states: any[] = [];

    service.getallWeatherEvents(countryCode, null, null, null, null, false, states).subscribe((events) => {
      expect(events.length).toBe(1); // Expect mock data response
    });

    const req = httpMock.expectOne('/api/WeatherAlerts/Search');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      reasonCode: null,
      countries: [],
      states: [],
      location: null,  
      startDate: new Date('1970-01-01'),
      endDate:new Date('1970-01-01'),   
      isActive: false,
    }); // Empty arrays should result in empty lists in the body
    req.flush(mockWeatherEventData);
  });


  // Test Case : Test empty weather events response
  it('should handle empty weather events response', () => {
    service.getallWeatherEvents(null, null, null, null, null, false, null).subscribe((events) => {
      expect(events.length).toBe(0); // Ensure the events array is empty
    });

    const req = httpMock.expectOne('/api/WeatherAlerts/Search');
    expect(req.request.method).toBe('POST');
    req.flush([]); // Return an empty array
  });


  // Test Case : Test error handling for failed API request
  it('should handle error from the weather events API', () => {
    service.getallWeatherEvents(null, null, null, null, null, false, null).subscribe(
      () => fail('Expected error, but got data'), // If data is returned, the test should fail
      (error) => {
        expect(error.status).toBe(500); // Simulate a 500 Internal Server Error
      }
    );

    const req = httpMock.expectOne('/api/WeatherAlerts/Search');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' }); // Simulate error response
  });

  // Sample mock data for countries
  const mockCountries: Country[] = [    
    { countryCode: 'US', countryName: 'United States',key: 'USA_key', value:'USA_Value' },
    { countryCode: 'IN', countryName: 'INDIA',key: 'IN_key', value:'IN_Value' },
    { countryCode: 'CAN', countryName: 'CANADA',key: 'CAN_key', value:'CAN_Value' },
  ];

   // Test Case : Test that the getallCountries method makes the correct HTTP request
   it('should call getallCountries and return the list of countries', () => {
    service.getallCountries().subscribe((countries) => {
      expect(countries.length).toBe(3); // We expect 3 countries from the mock data
      expect(countries[0].countryName).toBe('United States'); // Check the first country
      expect(countries[1].countryCode).toBe('IN'); // Check the second country's code
    });

    const req = httpMock.expectOne('/api/ReferenceData/Countries');
    expect(req.request.method).toBe('GET'); // Verify it is a GET request
    req.flush(mockCountries); // Mock the response with our mock data
  });

// Test Case : Test error handling when the API call fails
it('should handle error when the API call fails', () => {
  service.getallCountries().subscribe(
    () => fail('Expected error, but got data'), // This should not be called
    (error) => {
      expect(error.status).toBe(500); // Expect a 500 error (Internal Server Error)
      expect(error.statusText).toBe('Internal Server Error');
    }
  );

    const req = httpMock.expectOne('/api/ReferenceData/Countries');
    expect(req.request.method).toBe('GET');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' }); // Mock an error response
  });

 // Sample mock data for countries
 const mockWeatherTypes: WeatherType[] = [    
  { weatherTypeCode: 'Fl', weatherName: 'Flood',key: 'FL_key', value:'FL_Value' },
  { weatherTypeCode: 'Eq', weatherName: 'Earthquake',key: 'EQ_key', value:'EQ_Value' },
  { weatherTypeCode: 'St', weatherName: 'Strom',key: 'ST_key', value:'ST_Value' },
];
  
  // Test Case : Test that the getAllWeatherTypes method makes the correct HTTP request
  it('should call getAllWeatherTypes and return the list of weather types', () => {
    service.getAllWeatherTypes().subscribe((weatherTypes) => {
      expect(weatherTypes.length).toBe(3); // We expect 3 weather types from the mock data
      expect(weatherTypes[0].weatherName).toBe('Flood'); // Check the first weather type
      expect(weatherTypes[1].weatherTypeCode).toBe('Eq'); // Check the second weather type's code
    });

    const req = httpMock.expectOne('/api/ReferenceData/WeatherTypes');
    expect(req.request.method).toBe('GET'); // Verify it is a GET request
    req.flush(mockWeatherTypes); // Mock the response with our mock data
  });  

  // Test Case 3: Test error handling when the API call fails
  it('should handle error when the API call fails', () => {
    service.getAllWeatherTypes().subscribe(
      () => fail('Expected error, but got data'), // This should not be called
      (error) => {
        expect(error.status).toBe(500); // Expect a 500 error (Internal Server Error)
        expect(error.statusText).toBe('Internal Server Error');
      }
    );

    const req = httpMock.expectOne('/api/ReferenceData/WeatherTypes');
    expect(req.request.method).toBe('GET');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' }); // Mock an error response
  });

  // Sample mock data for weather event
  const mockWeatherEvent: WeatherEvent = {
    weatherEventId :123,
      weatherEventName : "Test",
      description :"TestDesc",
      country : {countryName:"USA", countryCode : "Name",  key: "key", value: "value"},
      weatherType : { weatherTypeCode: "ACT", weatherName: "Name", key: "key", value: "value"},
      location : "testLoc",
      startDate: new Date ('21-02-2025'),
      endDate:new Date ('22-02-2025'),
      stateList:"stateList",
      countryCode: "USA",
      alertName: "FloodAlert",
      alertType: "Flood",
      weatherAlertID: 123,
      activeBox: "Testactive",
      activeStatus: "Active",
      eventStatus: "Active"  
  };

  // Test Case : Test that the getWeatherEvent method makes the correct HTTP request with parameters
  it('should call getWeatherEvent with correct ID and return the weather event', () => {
    const weatherEvent_Id = 1;

    service.getWeatherEvent(weatherEvent_Id).subscribe((event) => {
      expect(event).toEqual(mockWeatherEvent); // Expect the returned data to match the mock data
   
    });

    const req = httpMock.expectOne((request) => 
      request.url === 'api/WeatherAlerts' && 
      request.params.has('ID') && 
      request.params.get('ID') === String(weatherEvent_Id)
    );
    expect(req.request.method).toBe('GET'); // Verify the request method is GET
    req.flush(mockWeatherEvent); // Mock the response with our mock data
  });

  // Test Case 2: Test if the service handles error when the API call fails
  it('should handle error when the API call fails', () => {
    const weatherEventId = 1;

    service.getWeatherEvent(weatherEventId).subscribe(
      () => fail('Expected error, but got data'), // This should not be called
      (error) => {
        expect(error.status).toBe(500); // Expect a 500 error (Internal Server Error)
        expect(error.statusText).toBe('Internal Server Error');
      }
    );

    const req = httpMock.expectOne((request) => 
      request.url === 'api/WeatherAlerts' && 
      request.params.has('ID') && 
      request.params.get('ID') === String(weatherEventId)
    );
    expect(req.request.method).toBe('GET');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' }); // Mock an error response
  });

  // Test Case : Test if the API request sends the correct parameters (ID)
  it('should send the correct ID as query parameter', () => {
    const weatherEventId = 1;

    service.getWeatherEvent(weatherEventId).subscribe();

    const req = httpMock.expectOne((request) => 
      request.url === 'api/WeatherAlerts' && 
      request.params.has('ID') && 
      request.params.get('ID') === String(weatherEventId)
    );
    expect(req.request.method).toBe('GET'); // Verify the request method is GET
    req.flush(mockWeatherEvent); // Mock the response with our mock data
  });

 

  it('should send the correct userName in the HTTP GET request', () => {   
    const userName = 'testUser';
    const mockResponse: any = ['admin', mockHeaders];
    
    spyOn(service, 'getHeaders').and.returnValue(mockHeaders);
    service.getUserAuthorization(userName).subscribe((response) => {     
      expect(response).toEqual(mockResponse);  // Ensure that the correct data is returned
    });

    // Expect the HTTP request to be made
    const req = httpMock.expectOne(request =>
      request.url === 'api/Authorization/UserAuthorization' &&
      request.method === 'GET' &&
      request.params.has('userName') &&
      request.params.get('userName') === mockUserName       
    );

    expect(req.request.method).toBe('GET');  // Ensure the request method is GET
    
    req.flush(mockResponse);  // Mock the response
  });

  it('should send the correct headers with the request', () => {
    const userName = 'testUser';
    const mockResponse: string[] = ['admin'];    
    
    // Mock the getHeaders() method by spyOn
    spyOn(service, 'getHeaders').and.returnValue(mockHeaders);

    // Call the function under test
    service.getUserAuthorization(userName).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    // Expect the HTTP GET request to have the correct headers    
    const req = httpMock.expectOne(request =>
      request.url === 'api/Authorization/UserAuthorization' &&
      request.method === 'GET' &&
      request.params.has('userName') && 
      request.params.get('userName') === userName       
    );

    // Check that the request method is GET
    expect(req.request.method).toBe('GET');

    // Check if headers are correct
    expect(req.request.headers.get('X-Api-Key')).toBe(mockHeaders.get('X-Api-Key'));
    expect(req.request.headers.get('Content-Type')).toBe(mockHeaders.get('Content-Type'));

    // Respond with mock data
    req.flush(mockResponse);

    // Ensure there are no outstanding HTTP requests
    httpMock.verify();
  });


  // Test Case : Check if the service handles error response correctly
  it('should handle error when the API call fails', () => {
    const userName = 'testUser';

    service.getUserAuthorization(userName).subscribe(
      () => fail('Expected error, but got data'),  // This should not be called
      (error) => {
        expect(error.status).toBe(500);  // Expect a 500 error (Internal Server Error)
        expect(error.statusText).toBe('Internal Server Error');
      }
    );

    // Simulate an error response from the server
    const req = httpMock.expectOne((request) =>
      request.url === 'api/Authorization/UserAuthorization' &&
      request.params.has('userName') &&
      request.params.get('userName') === userName
    );
    expect(req.request.method).toBe('GET');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });  // Mock the error response
  });

  it('should call HTTP post with correct payload', () => {
    const request: WeatherEventRequest = {
      WeatherAlertID: 123,
      vaCode: 'VACODE123',
      weatherAlertName: 'Storm Alert',
      weatherType: 'Storm',
      otherReason: 'Heavy rain',
      location: 'Location A',
      description: 'A severe storm is coming',
      startDate: new Date('2025-02-20'),
      endDate: new Date('2025-02-21'),
      statesArray: ['State1', 'State2'],
      countriesArray:  [] = [{country:'USA', usStates:['NY']}],
      userId: 'TestUser',
      isMapped:false,      
      otherDescription:'Desc',
      states:[{key:"key",value:'value'}],
      country:[{key:"key",value:'value'}],
      weatherMappingId :0
    };

    service.addWeatherEvent(request).subscribe(() => {
      const expectedBody = {
        weather_Event_Id: 123,
        vA_WeatherEvent_Code: 'VACODE123',
        name: 'Storm Alert',
        weather_Reason_Code: 'Storm',
        reason: 'Heavy rain',
        location: 'Location A',
        description: 'A severe storm is coming',
        startDate: new Date('2025-02-20T00:00:00Z').toISOString(),
        endDate: new Date('2025-02-20T12:00:00Z').toISOString(),
        states: ['State1', 'State2'],
        countries: ['Country1'],
        userId: 'testUser',
      };

      expect(postSpy).toHaveBeenCalledOnceWith('/api/WeatherAlerts/Save', expectedBody, { headers: service.getHeaders() });
    }); 
  });
    
 it('should handle missing statesArray and countriesArray gracefully', () => {
  const request: WeatherEventRequest = {
    WeatherAlertID: 123,
    vaCode: 'VACODE123',
    weatherAlertName: 'Storm Alert',
    weatherType: 'Storm',
    otherReason: 'Heavy rain',
    location: 'Location A',
    description: 'A severe storm is coming',
    startDate: new Date('2025-02-20'),
    endDate: new Date('2025-02-21'),
    statesArray: ['State1', 'State2'],
    countriesArray:  [] = [{country:'USA', usStates:['NY']}],
    userId: 'TestUser',
    isMapped:false,      
    otherDescription:'Desc',
    states:[],
    country:[],
    weatherMappingId :0
  };

  service.addWeatherEvent(request).subscribe(() => {
    const expectedBody = {
      weather_Event_Id: 789,
      vA_WeatherEvent_Code: 'VACODE789',
      name: 'Heatwave Alert',
      weather_Reason_Code: 'Heatwave',
      reason: 'Extreme temperatures',
      location: 'Location B',
      description: 'A heatwave is expected',
      startDate: new Date('2025-02-21T00:00:00Z').toISOString(),
      endDate: new Date('2025-02-21T12:00:00Z').toISOString(),
      states: null,
      countries: null,
      userId: 'testUser',
    };

    expect(postSpy).toHaveBeenCalledOnceWith('/api/WeatherAlerts/Save', expectedBody, { headers: service.getHeaders() });
  }); 
});
  





  it('should call deleteWeatherAlert and send correct parameters', () => {
   
    const userName = 'testUser';
    const mockResponse: string[] = ['admin'];    
    
    // Mock the getHeaders() method by spyOn
    spyOn(service, 'getHeaders').and.returnValue(mockHeaders);

    // Call the deleteWeatherAlert method
    service.deleteWeatherAlert(mockId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
   
    // Expect the HTTP request to be made
    const req = httpMock.expectOne(request => 
      request.url === '/api/WeatherAlerts/Delete' && 
      request.method === 'DELETE' && 
      request.params.has('eventId') &&
      request.params.get('eventId') === mockId &&
      request.params.has('userId') &&
      request.params.get('userId') === mockUserName 
    );    
   
    expect(req.request.headers.get('X-Api-Key')).toBe(mockHeaders.get('X-Api-Key'));
    // Mock the response
    req.flush(mockResponse);
  });

  it('should handle error response gracefully', () => {    
    const mockError = 'Error while deleting weather alert';

    // Call the deleteWeatherAlert method
    service.deleteWeatherAlert(mockId).subscribe(
      () => fail('expected an error, not a successful response'),
      (error) => {
        expect(error.status).toBe(500);  // Assuming server error is 500
        expect(error.statusText).toBe('Internal Server Error');
      }
    );

    // Expect the HTTP request to be made
    const req = httpMock.expectOne(request => 
      request.url === '/api/WeatherAlerts/Delete' && 
      request.method === 'DELETE'
    );

    // Respond with an error
    req.flush(mockError, { status: 500, statusText: 'Internal Server Error' });
  });
  
   
  it('should call getHeaders when making the request', () => {   
   spyOn(service, 'getHeaders').and.callThrough();  // Ensure getHeaders is called
    service.deleteWeatherAlert(mockId);
    // Check if getHeaders method was called
    expect(service.getHeaders).toHaveBeenCalled();    
  });
    






  // afterEach(() => {
  //   httpMock.verify();
  // });

});
