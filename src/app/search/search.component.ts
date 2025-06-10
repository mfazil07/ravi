var weatheralert = (function () {
    // Initializes the multiselect controls for weather alert dropdowns
    function initWeatherAlertMultiSelectControls() {
        $(".qtc-weather-alert-multi-select").multiselect({
            maxHeight: 350,
            minwidth: 250,
            numberDisplayed: 0,
            nonSelectedText: 'Select',
            buttonClass: 'form-control-drop-down form-control',
            buttonContainer: '<div class="btn-group form-control col-auto border-0 p-0" />',
        });
    }

    // Initializes the modal controls for weather alerts
    function initweatherAlertModalControls() {
        $("#weather-alerts").on("shown.bs.modal", function (evt) {
            setTitle(evt.relatedTarget.dataset["bsTitle"]);
            loadTable();
            bindTabEvents();
        });
    }

    // Sets the title for the modal
    function setTitle(account) {
        $("#weather-alert-modal-title")
            .html("")
            .append(
                "Weather Alert - ",
                "[ ",
                $("<span>").addClass("text-primary").html(account),
                " ]"
            );
    }

    // Loads weather alerts details into the details table
    function loadWeatherAlerts() {
        $.ajax({
            type: "GET",
            url: '/Appointment/GetWeatherAlertsDetails',
            headers: {
                "RequestVerificationToken": $('input[name = __RequestVerificationToken]').val()
            },
            data: {
                IsMapped: $("#cbxMapped").is(":checked")
            },
            success: function (result) {
                $("#tblWeatherAlertsDetails").html(result);
            }
        });
    }

    // Loads the main weather alerts table
    function loadTable() {
        $("#tblWeatherAlerts").dataTable({
            searching: true,
            bFilter: true,
            initComplete: function () {
                removeLoader();
                $("#tblWeatherAlerts").show();
            },
            lengthMenu: [10, 25, 50, 75, 100],
            bInfo: true,
            responsive: true,
            order: [[7, "desc"]],
            bAutoWidth: true,
            columnDefs: [{ targets: [0, 8], orderable: false }]
        });
    }

    // Loads the secondary weather alerts table (for tab change)
    function loadTable1() {
        $("#tblWeatherAlerts1").dataTable({
            searching: true,
            bFilter: true,
            initComplete: function () {
                removeLoader();
                $("#tblWeatherAlerts1").show();
            },
            lengthMenu: [10, 25, 50, 75, 100],
            bInfo: true,
            responsive: true,
            order: [[7, "desc"]],
            bAutoWidth: true
        });
    }

    // Removes loading spinner/div
    function removeLoader() {
        $("#loadingDiv").fadeOut(500, function () {
            $("#loadingDiv").remove();
        });
    }

    // Binds tab change events to load the correct data table
    function bindTabEvents() {
        $("#wa-nav-tabs").on("shown.bs.tab", function (evt) {
            if (evt.target.id === "nav-wa-appt-level") loadTable1();
        });
    }

    // Updates the weather events dropdown based on AJAX result
    function updateWeatherEventsDropdown(events) {
        var eventId = $('#weatherAlertEventId').val();
        var $dropdown = $('#' + eventId);
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

    // Shows/hides weather alerts section based on requested by and reason values
    function toggleWeatherAlerts() {
        var countryId = $('#weatherAlertCountryId').val();
        var stateId = $('#weatherAlertStateId').val();
        var eventId = $('#weatherAlertEventId').val();
        var selectedCountriesFromModel = JSON.parse($('#countriesData').val() || '[]');
        var selectedStatesFromModel = JSON.parse($('#statesData').val() || '[]');
        var requestedByVal = $("#ddlRequestedBy option:selected").val();
        var rescheduleReasonVal = $("#ddlRescheduleReason option:selected").val();

        if (requestedByVal && requestedByVal !== "6" //VA
            && rescheduleReasonVal === "COMRES39") {
            $("#weatherAlertsSection").show();
            $('#' + countryId).val(selectedCountriesFromModel).trigger("change");
            $('#' + stateId).val(selectedStatesFromModel).trigger("change");

            if ($('#' + countryId).data('multiselect')) {
                $('#' + countryId).multiselect('refresh');
                $('#' + stateId).multiselect('refresh');
            }
            callGetWeatherEvents();
        } else {
            $("#weatherAlertsSection").hide();
            $('#' + countryId).val(null).trigger("change");
            $('#' + stateId).val(null).trigger("change");
            $('#' + eventId).val("").trigger("change");

            if ($('#' + countryId).data('multiselect')) {
                $('#' + countryId).multiselect('refresh');
                $('#' + stateId).multiselect('refresh');
            }
        }
    }

    // Calls the backend to get weather events for the selected country/state
    function callGetWeatherEvents() {
        var countryId = $('#weatherAlertCountryId').val();
        var stateId = $('#weatherAlertStateId').val();
        setTimeout(function () {
            var selectedStates = [];
            $('#' + stateId).next(".btn-group").find("input:checked").each(function () {
                selectedStates.push($(this).val());
            });

            var selectedCountries = $('#' + countryId).val();

            if (selectedCountries && selectedCountries.includes("USA") && selectedStates.length === 0) {
                updateWeatherEventsDropdown([]);
                return;
            }

            if (!selectedCountries || selectedCountries.length === 0) {
                updateWeatherEventsDropdown([]);
                return;
            }

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
        }, 50);
    }

    // Main initializer for weather alert reschedule UI
    function initWeatherAlertReschedule() {
        var countryId = $('#weatherAlertCountryId').val();
        var stateId = $('#weatherAlertStateId').val();
        var selectedCountriesFromModel = JSON.parse($('#countriesData').val() || '[]');
        var selectedStatesFromModel = JSON.parse($('#statesData').val() || '[]');

        if ($('#' + countryId).data('multiselect')) {
            $('#' + countryId).multiselect('refresh');
            $('#' + stateId).multiselect('refresh');
        }

        callGetWeatherEvents();

        $('#' + countryId + ', #' + stateId).on('change', function () {
            callGetWeatherEvents();
        });

        if (selectedCountriesFromModel.includes("USA") && selectedStatesFromModel.length > 0) {
            $('#' + stateId).closest(".form-group").show();
        } else {
            $('#' + stateId).closest(".form-group").hide();
        }

        $(document).on("change", "#ddlRequestedBy, #ddlRescheduleReason", function () {
            toggleWeatherAlerts();
        });

        $('#' + countryId).on("change", function () {
            var selectedCountries = $(this).val();
            if (selectedCountries && selectedCountries.includes("USA")) {
                $('#' + stateId).closest(".form-group").show();
            } else {
                $('#' + stateId).closest(".form-group").hide();
                $('#' + stateId).val([]).trigger("change");
            }
        });

        initWeatherAlertMultiSelectControls();
    }

    // Only export the functions actually used outside
    return {
        initWeatherAlertReschedule: initWeatherAlertReschedule,
        initWeatherAlertMultiSelectControls: initWeatherAlertMultiSelectControls,
        initweatherAlertModalControls: initweatherAlertModalControls,
        loadWeatherAlerts: loadWeatherAlerts
    };
})();
