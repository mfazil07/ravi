@section scripts {
    <script>
        $(function () {
            if (typeof weatheralert !== 'undefined') {
                weatheralert.init(); // your setup logic
            }
        });
    </script>
}

var weatheralert = (function () {

    function initWeatherAlertControls() {
        $(".qtc-weather-alert-multi-select").multiselect({
            maxHeight: 350,
            minwidth: 250,
            numberDisplayed: 0,
            nonSelectedText: 'Select',
            buttonClass: 'form-control-drop-down form-control',
            buttonContainer: '<div class="btn-group form-control col-auto border-0 p-0" />',
        });
    }

    function initweatherAlertModalControls() {
        $("#weather-alerts").on("shown.bs.modal", function (evt) {
            setTitle(evt.relatedTarget.dataset["bsTitle"]);
            loadTable();
            bindTabEvents();
        });
    }

    function setTitle(account) {
        $("#weather-alert-modal-title").html("");
        $("#weather-alert-modal-title").append(
            "Weather Alert - ",
            "[ ",
            $("<span>").addClass("text-primary").html(account),
            " ]"
        );
    }

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

    function disableOnMapped() {
        if ($("#cbxMapped").is(":checked")) {
            $(".disable-on-mapped").prop("disabled", "disabled");
        } else {
            $(".disable-on-mapped").prop("disabled", "");
        }
    }

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

    function removeLoader() {
        $("#loadingDiv").fadeOut(500, function () {
            $("#loadingDiv").remove();
        });
    }

    function bindTabEvents() {
        $("#wa-nav-tabs").on("shown.bs.tab", function (evt) {
            if (evt.target.id === "nav-wa-appt-level") loadTable1();
        });
    }

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

    $(document).ready(function () {
        var countryId = $('#weatherAlertCountryId').val();
        var stateId = $('#weatherAlertStateId').val();
        var eventId = $('#weatherAlertEventId').val();

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

        function toggleWeatherAlerts() {
            var requestedByVal = $("#ddlRequestedBy option:selected").val();
            var rescheduleReasonVal = $("#ddlRescheduleReason option:selected").val();

            if (requestedByVal && requestedByVal !== "VA" && rescheduleReasonVal === "COMRES39") {
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

        function callGetWeatherEvents() {
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
            }, 100);
        }

        $("#ddlRequestedBy, #ddlRescheduleReason").on("change", function () {
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
    });

    return {
        initWeatherAlertControls: initWeatherAlertControls,
        initweatherAlertModalControls: initweatherAlertModalControls,
        loadWeatherAlerts: loadWeatherAlerts
    };

})();
