<script>
    // -- Pass selected values from Razor model --
    var selectedCountries = @Html.Raw(Json.Serialize(Model.Country ?? new List<string>()));
    var selectedStates = @Html.Raw(Json.Serialize(Model.State ?? new List<string>()));

    console.log(selectedCountries);

    function updateWeatherEventsDropdown(events) {
        var $dropdown = $("#@idDDWeatherEvent");
        $dropdown.empty();
        $dropdown.append('<option value="">- Select Weather Alert -</option>');
        if (events && events.length) {
            events.forEach(function (event) {
                var text = "Event: " + event.WeatherEventName + ", Type: " + event.Reason +
                    ", Description: " + event.Description +
                    " [" + event.StartDate + " - " + event.EndDate + "]";
                $dropdown.append('<option value="' + event.WeatherEventId + '">' + text + '</option>');
            });
        }
    }

    $(document).ready(function () {
        // 1. Initialize Country & State Bootstrap Multiselects
        $('#@idDDCountry').multiselect({
            includeSelectAllOption: true,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            buttonWidth: '100%',
            maxHeight: 300,
            buttonClass: 'form-control text-left',
            nonSelectedText: '- Select Country -',
            selectAllText: 'Select All',
            allSelectedText: 'All Selected',
            nSelectedText: 'Selected',
            templates: {
                filter: '<li class="multiselect-item multiselect-filter"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
                filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button"><i class="fa fa-times"></i></button></span>'
            }
        });

        $('#@idDDState').multiselect({
            includeSelectAllOption: true,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            buttonWidth: '100%',
            maxHeight: 300,
            buttonClass: 'form-control text-left',
            nonSelectedText: '- Select State -',
            selectAllText: 'Select All',
            allSelectedText: 'All Selected',
            nSelectedText: 'Selected'
        });

        // 2. Set selected values and refresh
        $('#@idDDCountry').multiselect('select', ['USA'])

        $('#@idDDState').multiselect('select', ['CA'])


        // 3. Toggle State dropdown visibility depending on country selection
        function toggleStateDropdown() {
            var selCountries = $('#@idDDCountry').val();
            if (selCountries && selCountries.includes('USA')) {
                $('#@idDDState').closest('.form-group').show();
            } else {
                $('#@idDDState').closest('.form-group').hide();
                $('#@idDDState').val([]).multiselect('refresh');
            }
        }
        toggleStateDropdown();

        // 4. Show/hide weather alert section based on other dropdowns
        function toggleWeatherAlerts() {
            var requestedByText = $("#ddlRequestedBy option:selected").text();
            var rescheduleReasonText = $("#ddlRescheduleReason option:selected").text();

            if (requestedByText === "EXAMINEE" && rescheduleReasonText === "Appointment rescheduled per weather event") {
                $("#weatherAlertsSection").show();
                $('#@idDDCountry').multiselect('refresh');
                $('#@idDDState').multiselect('refresh');
            } else {
                $("#weatherAlertsSection").hide();
                $('#@idDDState').multiselect('deselectAll', false).multiselect('updateButtonText');
                $('#@idDDCountry').multiselect('deselectAll', false).multiselect('updateButtonText');
                $("#@idDDWeatherEvent").val(null).trigger("change");
                $(".qtc-weather-alert-multi-select").each(function () {
                    $(this).find("option:selected").removeAttr("selected");
                    $(this).val("").trigger("change");
                });
            }
        }

        // 5. Event bindings
        $("#ddlRequestedBy, #ddlRescheduleReason").on("change", function () {
            toggleWeatherAlerts();
        });

        $('#@idDDCountry').on('change', function () {
            toggleStateDropdown();
            triggerWeatherEventsCheck();
        });

        $('#@idDDState').on('change', function () {
            triggerWeatherEventsCheck();
        });

        // Hide state dropdown on load if USA not selected
        toggleStateDropdown();

        // 6. Weather Event AJAX logic
        function triggerWeatherEventsCheck() {
            setTimeout(function () {
                var selectedStates = $('#@idDDState').val() || [];
                var selectedCountries = $('#@idDDCountry').val();

                // Handle USA: States must be selected
                if (selectedCountries && selectedCountries.includes("USA")) {
                    if (selectedStates.length === 0) {
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

        // 7. Initial Weather Alerts visibility on load
        toggleWeatherAlerts();
    });
</script>
