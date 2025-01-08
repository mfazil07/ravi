

export interface WeatherType {
    weatherTypeId:number
    weatherTypeCode: string
    weatherName: string
  }
  
  export interface WeatherEvent{
  
    weatherEventId :number
    weatherEventName : string
    description :string
    country : Country
    weatherType : WeatherType
    location : string
    startDate: Date
    endDate:Date
  }
  
  export interface WeatherEventTable{
    Country :string
    WeatherType:string
    Name:string
    Description:string
    StartDate:Date
    EndDate:Date
  }
  
  
  export interface Country {
      countryCode :string
      countryName : string
    }

    export interface WeatherEventRequest{
      weatherMappingId :number
      weatherEventId :number
      weatherEventName : string
      description :string
      country : string
      weatherType : string
      location : string
      startDate: Date
      endDate:Date
    }
    