import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClaimantsWeatherAlertsService } from './claimants-weather-alerts.service';
import { CaseWithAppointment, CaseDetails, KeyValueObject, SaveImpactedAlertsRequest } from '../dtos/dtos';

fdescribe('ClaimantsWeatherAlertsService', () => {
  let service: ClaimantsWeatherAlertsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimantsWeatherAlertsService]
    });

    service = TestBed.inject(ClaimantsWeatherAlertsService);
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(sessionStorage, 'getItem').and.returnValue('mock-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch claimant info with correct headers and params', () => {
    const mockClaimantId = 123, mockCaseId = 456, mockIsMapped = false;
    const mockResponse: CaseWithAppointment[] = [];

    service.getClaimantInfo(mockClaimantId, mockCaseId, mockIsMapped).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/CaseAlerts/AccountInfo?claimantid=${mockClaimantId}&caseid=${mockCaseId}&ismapped=${mockIsMapped}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token');
    req.flush(mockResponse);
  });

  it('should fetch case appointments with correct headers and params', () => {
    const mockClaimantId = 123, mockCaseId = 456;
    const mockResponse: CaseDetails[] = [];

    service.GetCaseWithAppointments(mockClaimantId, mockCaseId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/CaseAlerts/ImpactedAppts?claimantId=${mockClaimantId}&caseId=${mockCaseId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token');
    req.flush(mockResponse);
  });

  it('should make a POST request without optional params if not provided', () => {
    const mockClaimantId = 123, mockCaseId = 456;
    const mockResponse: CaseDetails[] = [];
  
    service.GetUnmappedWeatherEvents(mockClaimantId, mockCaseId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(request =>
      request.url === '/api/CaseAlerts/Search' &&
      request.method === 'POST' &&
      request.body.claimantId === mockClaimantId &&
      request.body.caseId === mockCaseId &&
      request.body.mappedEventsOnly === false &&
      request.body.startDate === null &&
      request.body.endDate === null &&
      request.body.location === null &&
      Array.isArray(request.body.countries) && request.body.countries.length === 0 &&
      Array.isArray(request.body.states) && request.body.states.length === 0
    );
  
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token');
    req.flush(mockResponse);
  });
  
  

  it('should save impacted alerts with correct headers and body', () => {
    const mockRequest: SaveImpactedAlertsRequest = { claimantId: 123, caseId: 456, impactedAlerts: [], userName: 'ittest' };
    const mockResponse = { success: true };

    service.addCaseWeatherEvent(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/CaseAlerts/SaveImpactedAlerts');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should include optional parameters in the request when provided', () => {
    const mockClaimantId = 123, mockCaseId = 456;
    const mockStartDate = new Date('2023-10-01'), mockEndDate = new Date('2023-10-10');
    const mockLocation = 'Florida', mockMappedEventsOnly = true;
    const mockCountries: KeyValueObject[] = [{ key: 'USA', value: 'United States' }];
    const mockStates: KeyValueObject[] = [{ key: 'CA', value: 'California' }, { key: 'TX', value: 'Texas' }];
    const mockResponse: CaseDetails[] = [];

    service.GetUnmappedWeatherEvents(mockClaimantId, mockCaseId, mockStartDate, mockEndDate, mockLocation, mockCountries, mockStates, mockMappedEventsOnly)
      .subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(request =>
      request.url === '/api/CaseAlerts/Search' &&
      request.method === 'POST' &&
      request.body.claimantId === mockClaimantId &&
      request.body.caseId === mockCaseId &&
      request.body.startDate.toISOString() === mockStartDate.toISOString() &&
      request.body.endDate.toISOString() === mockEndDate.toISOString() &&
      request.body.location === mockLocation &&
      request.body.mappedEventsOnly === mockMappedEventsOnly &&
      request.body.countries.every((c: KeyValueObject, i: number) => c.key === mockCountries[i].key) &&
      request.body.states.every((s: KeyValueObject, i: number) => s.key === mockStates[i].key)
    );

    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token');
    req.flush(mockResponse);
  });
});
