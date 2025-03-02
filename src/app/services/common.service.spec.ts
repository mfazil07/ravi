import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClaimantsWeatherAlertsService } from './claimants-weather-alerts.service';
import { CaseWithAppointment, CaseDetails,SaveImpactedAlertsRequest } from '../dtos/dtos';

describe('ClaimantsWeatherAlertsService', () => {
  let service: ClaimantsWeatherAlertsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimantsWeatherAlertsService]
    });

    // Initialize the service and HTTP mock
    service = TestBed.inject(ClaimantsWeatherAlertsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock sessionStorage token
    spyOn(sessionStorage, 'getItem').and.returnValue('mock-token');
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should make a GET request to fetch claimant info with correct headers and params', () => {
    // Arrange
    const mockClaimantId = 123;
    const mockCaseId = 456;
    const mockResponse: CaseWithAppointment[] = []; // Mock response data

    // Act
    service.getClaimantInfo(mockClaimantId, mockCaseId).subscribe((response) => {
      expect(response).toEqual(mockResponse); // Assert response matches mock data
    });

    // Assert
    const req = httpMock.expectOne(
      `/api/CaseAlerts/AccountInfo?claimantid=${mockClaimantId}&caseid=${mockCaseId}`
    );
    expect(req.request.method).toBe('GET'); // Verify HTTP method
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token'); // Verify headers
    expect(req.request.params.get('claimantid')).toBe(mockClaimantId.toString()); // Verify params
    expect(req.request.params.get('caseid')).toBe(mockCaseId.toString()); // Verify params

    // Respond with mock data
    req.flush(mockResponse);
  });

  it('should make a GET request to fetch case appointments with correct headers and params', () => {
    // Arrange
    const mockClaimantId = 123;
    const mockCaseId = 456;
    const mockResponse: CaseDetails[] = []; // Mock response data
  
    // Act
    service.GetCaseWithAppointments(mockClaimantId, mockCaseId).subscribe((response) => {
      expect(response).toEqual(mockResponse); // Assert response matches mock data
    });
  
    // Assert
    const req = httpMock.expectOne(
      `/api/CaseAlerts/ImpactedAppts?claimantId=${mockClaimantId}&caseId=${mockCaseId}`
    );
    expect(req.request.method).toBe('GET'); // Verify HTTP method
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token'); // Verify headers
    expect(req.request.params.get('claimantId')).toBe(mockClaimantId.toString()); // Verify params
    expect(req.request.params.get('caseId')).toBe(mockCaseId.toString()); // Verify params
  
    // Respond with mock data
    req.flush(mockResponse);
  });

  xit('should make a GET request without optional params if they are not provided', () => {
    // Arrange
    const mockClaimantId = 123;
    const mockCaseId = 456;
    const mockStartDate ='2025-12-01';
    const mockEndate = '2025-02-01';
    const mockResponse: CaseDetails[] = []; // Mock response data

    // Act
    service.GetUnmappedWeatherEvents(mockClaimantId, mockCaseId).subscribe((response) => {
      expect(response).toEqual(mockResponse); // Assert response matches mock data
    });

    // Assert
    const req = httpMock.expectOne(
      (request) =>
        request.url === '/api/CaseAlerts/Search' &&
        request.params.get('claimantId') === mockClaimantId.toString() &&
        request.params.get('caseId') === mockCaseId.toString() &&
        request.params.get('startDate') === mockStartDate.toString() &&
        request.params.get('endDate') === mockEndate.toString() &&
        !request.params.has('location') &&
        !request.params.has('mappedEventsOnly')
    );

    expect(req.request.method).toBe('GET'); // Verify HTTP method
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token'); // Verify headers

    // Respond with mock data
    req.flush(mockResponse);
  });

  it('should make a POST request to save impacted alerts with correct headers and body', () => {
    // Arrange
    const mockRequest: SaveImpactedAlertsRequest = {
      // Populate with mock data based on your SaveImpactedAlertsRequest interface
      claimantId: 123,
      caseId: 456,
      impactedAlerts: [],
      userName: 'ittest' // Add mock data as needed
    };
    const mockResponse = { success: true }; // Mock response data

    // Act
    service.addCaseWeatherEvent(mockRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse); // Assert response matches mock data
    });

    // Assert
    const req = httpMock.expectOne('/api/CaseAlerts/SaveImpactedAlerts');
    expect(req.request.method).toBe('POST'); // Verify HTTP method
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token'); // Verify headers
    expect(req.request.body).toEqual(mockRequest); // Verify request body

    // Respond with mock data
    req.flush(mockResponse);
  });

  it('should include optional parameters in the request when provided', () => {
    // Arrange
    const mockClaimantId = 123;
    const mockCaseId = 456;
    const mockStartDate = '2023-10-01';
    const mockEndDate = '2023-10-10';
    const mockLocation = 'Florida';
    const mockMappedEventsOnly = true;
    const mockResponse: CaseDetails[] = []; // Mock response data

    // Act
    service.GetUnmappedWeatherEvents(mockClaimantId, mockCaseId, mockStartDate, mockEndDate, mockLocation, mockMappedEventsOnly)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse); // Assert response matches mock data
      });

    // Assert
    const req = httpMock.expectOne(
      (request) =>
        request.url === '/api/CaseAlerts/Search' &&
        request.params.get('claimantId') === mockClaimantId.toString() &&
        request.params.get('caseId') === mockCaseId.toString() &&
        request.params.get('startDate') === mockStartDate &&
        request.params.get('endDate') === mockEndDate &&
        request.params.get('location') === mockLocation &&
        request.params.get('mappedEventsOnly') === mockMappedEventsOnly.toString()
    );

    expect(req.request.method).toBe('GET'); // Verify HTTP method
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token'); // Verify headers

    // Respond with mock data
    req.flush(mockResponse);
  });

  it('should exclude optional parameters when they are not provided', () => {
    // Arrange
    const mockClaimantId = 123;
    const mockCaseId = 456;
    const mockResponse: CaseDetails[] = []; // Mock response data

    // Act
    service.GetUnmappedWeatherEvents(mockClaimantId, mockCaseId).subscribe((response) => {
      expect(response).toEqual(mockResponse); // Assert response matches mock data
    });

    // Assert
    const req = httpMock.expectOne(
      (request) =>
        request.url === '/api/CaseAlerts/Search' &&
        request.params.get('claimantId') === mockClaimantId.toString() &&
        request.params.get('caseId') === mockCaseId.toString() &&
        !request.params.has('startDate') &&
        !request.params.has('endDate') &&
        !request.params.has('location') &&
        !request.params.has('mappedEventsOnly')
    );

    expect(req.request.method).toBe('GET'); // Verify HTTP method
    expect(req.request.headers.get('X-Api-Key')).toBe('mock-token'); // Verify headers

    // Respond with mock data
    req.flush(mockResponse);
  });
});

 
 

 
