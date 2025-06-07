$('#ddlRescheduleApptState').multiselect('deselectAll', false);
$('#ddlRescheduleApptState').multiselect('updateButtonText');
$('#ddlRescheduleApptCountry').multiselect('deselectAll', false);
$('#ddlRescheduleApptCountry').multiselect('updateButtonText');



function triggerWeatherEventsCheck() {
    setTimeout(function () {
        // Gather selections
        var selectedStates = [];
        $("#ddlRescheduleApptState").next(".btn-group").find("input:checked").each(function () {
            selectedStates.push($(this).val());
        });
        var selectedCountries = $("#ddlRescheduleApptCountry").val();

        // Handle USA: States must be selected
        if (selectedCountries && selectedCountries.includes("USA")) {
            if (selectedStates.length === 0) {
                // No state selected with USA -- clear weather events and do NOT call AJAX
                updateWeatherEventsDropdown([]);
                return;
            }
        }

        // If no country selected at all, clear weather events
        if (!selectedCountries || selectedCountries.length === 0) {
            updateWeatherEventsDropdown([]);
            return;
        }

        // If another country (not USA), proceed with AJAX (states irrelevant)
        var data = {
            Country: selectedCountries,
            State: selectedStates.length > 0 ? selectedStates : null
        };

        $.ajax({
            url: "/RescheduleReason/GetWeatherEvents",
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processData: false,
            success: function (response) {
                updateWeatherEventsDropdown(response);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching weather events:", error);
            }
        });
    }, 100);
}
