<input type="hidden" id="weatherAlertCountryId" value="@idDDCountry" />
<input type="hidden" id="weatherAlertStateId" value="@idDDState" />
<input type="hidden" id="weatherAlertEventId" value="@idDDWeatherEvent" />


var countryId = $('#weatherAlertCountryId').val();
var stateId = $('#weatherAlertStateId').val();
var eventId = $('#weatherAlertEventId').val();

// Use these IDs instead of hardcoded ones
$('#' + countryId)...
