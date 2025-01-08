import { Component, OnInit } from '@angular/core';
import { SearchForm, weatherEventType } from '../models/notification';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'notification-search',
  templateUrl: './notification-search.component.html',
  styleUrl: './notification-search.component.css'
})
export class NotificationSearchComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}
  selectedEvents:weatherEventType[] = [];
  weatherEvents:Array<weatherEventType>=[
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Hurricane Delta",
        "weatherType": "Hurricane",
        "description": "A powerful hurricane causing severe flooding and strong winds",
        "location": "Louisiana",
        "country": "United States",
        "state": "Louisiana",
        "eventStartDate": "2020-10-06",
        "eventEndDate": "2020-10-10",
        "status": "active"
    },
    {
        "weatherEvent": "Winter Storm Jonas",
        "weatherType": "Blizzard",
        "description": "A severe winter storm bringing heavy snow and freezing temperatures",
        "location": "Northeast United States",
        "country": "United States",
        "state": "Multiple States",
        "eventStartDate": "2016-01-22",
        "eventEndDate": "2016-01-25",
        "status": "inactive"
    },
    {
        "weatherEvent": "Heatwave 2021",
        "weatherType": "Heatwave",
        "description": "A prolonged period of extreme heat and humidity",
        "location": "Pacific Northwest",
        "country": "United States",
        "state": "Oregon, Washington, British Columbia",
        "eventStartDate": "2021-06-25",
        "eventEndDate": "2021-07-01",
        "status": "inactive"
    },
    {
        "weatherEvent": "Wildfire Season 2020",
        "weatherType": "Wildfire",
        "description": "Numerous wildfires burning across the Western United States",
        "location": "Western United States",
        "country": "United States",
        "state": "California, Oregon, Washington",
        "eventStartDate": "2020-08-15",
        "eventEndDate": "2020-09-15",
        "status": "inactive"
    },
    {
        "weatherEvent": "Tornado Outbreak 2011",
        "weatherType": "Tornado",
        "description": "A series of tornadoes that struck the Southern United States",
        "location": "Southern United States",
        "country": "United States",
        "state": "Alabama, Mississippi, Tennessee",
        "eventStartDate": "2011-04-25",
        "eventEndDate": "2011-04-28",
        "status": "inactive"
    }
  ]
    notifficationDetails = {
      caseId:'5507744.2',
      miniTeam:'310AB',
      name:'Last Name, First Name',
      dob:'12/05/1965',
      gender:'m',
      ssn:'XXXX-XX-9999'
    }

    searchForm: SearchForm | null=null;

    onSearch(_form:{form: SearchForm, type: string}){
      switch(_form.type){
        case 'search':
            this.handleSearch(_form.form)
          break;
        case 'save':
            this.handleSave(_form.form)
          break;
      }
    }

    /**
     *    Trigger when a row is selected in the grid table
     */
    handleSelectionChange(selectedRow:Array<any>){
      this.selectedEvents = selectedRow;
    }

    /**
     *    handle save form event
     */
    handleSave(payload:SearchForm){
      console.log(payload)
    }

    /**
     *    Handle form search event
     */
    handleSearch(payload: SearchForm){
      // Call the api to search the data 
      console.log(payload)
    }

    ngOnInit() {
      this.route.queryParamMap.subscribe((params) => {
        const claimantId = params.get('claimantid'); // Replace 'param1' with your query parameter name
        const caseId = params.get('caseid');
      });
    }
}
