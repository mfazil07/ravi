export interface weatherEventType{
    weatherEvent: string,
    weatherType: string,
    description: string,
    location: string,
    country: string,
    state: string,
    eventStartDate: string,
    eventEndDate: string,
    status: string,
  }

  export interface SearchForm{
    startDate: string,
    endDate:string,
    location:string
  }

  export  interface NotificationEventType{
    caseId: string,
    miniTeam: string,
    name: string,
    dob: string,
    gender: string,
    ssn: string
  }