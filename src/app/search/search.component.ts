var positiveConfirmationIdValue = "";
var appointmentIdValue = "";
var sessionId = "";
var removeToggle = "";
var isCnfrmApptModal = false;
var hasDOAPassed = false;
var hasPCNTTracking = false;
var PositiveContactRules = {};
var isVALob = $('input[name=IsVaLOB]').val() == "True";


function FillTypesOnChange(element, targetDropdownId) {
    var currentValue = $(element).val();
    var currentElementId = $(element).attr('id');
    var targetDropdown = $("#" + targetDropdownId);
    var rules = [];
    var dictionary = {};
    var dictRules = {};
    var contactAttemptErrorContainer = $("#contactAttempt-modal-validation-summary");
    contactAttemptErrorContainer.html("");
    var contactAttemptErrorDiv = $("#div-contactAttemptmodal-error-container");
    contactAttemptErrorDiv.html("");

    if (currentValue <= 0) {
        return false;
    }

    for (var key in PositiveContactRules) {
        var targetId;
        var targetDesc;

        if (currentValue == PositiveContactRules[key].contactId && 'ContactCommunicationMethod' === currentElementId
                        && PositiveContactRules[key].allowManualCommunicationMethod === 'Y'
            ) {
            targetId = PositiveContactRules[key].communicationMethodId;
            targetDesc = PositiveContactRules[key].communicationMethodDesc;
        } else if ('CommunicationMethod' === currentElementId
                   && currentValue == PositiveContactRules[key].communicationMethodId
                   && $('#ContactCommunicationMethod').val() == PositiveContactRules[key].contactId) {
            targetId = PositiveContactRules[key].confirmationTypeId;
            targetDesc = PositiveContactRules[key].confirmationTypeDesc;
        } else if ('ConfirmationType' === currentElementId
                   && currentValue == PositiveContactRules[key].confirmationTypeId
                   && $('#CommunicationMethod').val() == PositiveContactRules[key].communicationMethodId
                   && $('#ContactCommunicationMethod').val() == PositiveContactRules[key].contactId) {
            targetId = PositiveContactRules[key].communicationResponseId;
            targetDesc = PositiveContactRules[key].communicationResponseDesc;
        }
        //else if ('AdaType' === currentElementId && currentValue == PositiveContactRules[key].adaTypeId) {
        //    targetId = PositiveContactRules[key].adaOptionId;
        //    targetDesc = PositiveContactRules[key].adaOptionDesc;
        //}

        //console.log(targetId);

        if (targetId && !dictRules.hasOwnProperty(targetId)) {
            dictRules[targetId] = targetDesc;
        }
    }

    if (Object.keys(dictRules).length > 0) {
        const iconResponse = ["Ready To Schedule", "Unable To Schedule", "Searching for Provider"];
        $(targetDropdown).html("");

        for (var key in dictRules) {
            // check if the property/key is defined in the object itself, not in parent
            if (dictRules.hasOwnProperty(key) && targetDropdownId == 'CommunicationReponseType' && iconResponse.indexOf(dictRules[key]) >= 0) {
                $(targetDropdown).append(
                    $('<option></option>')
                        .val(key)
                        .html(dictRules[key] + '&nbsp; &#xf21e;'));
            } else if (dictRules.hasOwnProperty(key)) {
                $(targetDropdown).append(
                    $('<option></option>')
                        .val(key)
                        .html(dictRules[key]));
            }
        }

        resetDropdownsOnChange(currentElementId);
    } else {
        $('#CommunicationReponseType').prop('selectedIndex', -1);//reset dropdown
        disableCommunicationResponse();
    }
    //if confirmation type is confirmed and at appt level
    confirmationTypeIdValue = document.getElementById('ConfirmationType').value;

    if (confirmationTypeIdValue == '1' && isCnfrmApptModal) {
        $("#pcntContactAttemptModal").find("#CommunicationReponseTypeDiv").hide();
        $("#pcntContactAttemptModal").find("#pcntContactAttemptAdaDiv").hide();
        $("#pcntContactAttemptModal").find("#pcntContactAttemptProviderGenderPreferenceTypeDiv").hide();
        $("#pcntContactAttemptModal").find("#pcntContactAttemptChaperoneGenderPreferenceTypeDiv").hide();
        $("#pcntContactAttemptModal").find(".linebreakHideOrShow").hide();
        document.getElementById("CommunicationReponseType").disabled = true;
        document.getElementById("adaTypeDropdown").disabled = true;
    }
}

function resetDropdownsOnChange(currentElementId) {
    var confirmationTypeId = $('#ConfirmationType').val();

    if ('ContactCommunicationMethod' === currentElementId) {

        $('#CommunicationMethod').prop('selectedIndex', -1);//reset dropdown
        $('#CommunicationMethod').removeAttr('disabled');//enable dropdown

        $('#ConfirmationType').prop('selectedIndex', -1);//reset dropdown
        $('#ConfirmationType').html("");//empty dropdown

        $('#CommunicationReponseType').prop('selectedIndex', -1);//reset dropdown
        $('#CommunicationReponseType').html("");//empty dropdown

        //toggle the require field validator for "Person Spoken To" and  "Notes" fields
        toggleMandatoryIndicator();

    } else if ('CommunicationMethod' === currentElementId) {

        $('#ConfirmationType').prop('selectedIndex', -1);//reset dropdown
        $('#ConfirmationType').removeAttr('disabled');//enable dropdown

        $('#CommunicationReponseType').prop('selectedIndex', -1);//reset dropdown
        $('#CommunicationReponseType').html("");//empty dropdown

    } else if ('ConfirmationType' === currentElementId) {
        $('#CommunicationReponseType').prop('selectedIndex', -1);//reset dropdown
        $('#CommunicationReponseType').removeAttr('disabled');//enable dropdown
        
        $('#pcntContactAttemptModal').find('.lblRequiredNotes').css({ "color": "#ff1616" });
        //if confirmation type is not email received
        if (confirmationTypeId != "86") {
            $('#pcntContactAttemptModal').find('.lblRequiredSpokenTo').css({ "color": "#ff1616" });
        }
    }

    disableConfirmationType();
}

function FillConfTypesByCommnMethodId(CommunicationMethodId, ConfirmationTypeId) {
    var communicationMethodObj = $('#' + CommunicationMethodId);
    var ConfirmationTypeObj = $('#' + ConfirmationTypeId);

    var communicationMethodId = $(communicationMethodObj).val();

    //var communicationMethodId = $('#CommunicationMethod').val();
    if (communicationMethodId > -1) {

        $.ajax({
            url: 'FillConfTypesByCommnMethodId',
            type: "GET",
            dataType: "JSON",
            data: { communicationMethodId: communicationMethodId },
            success: function (confirmationTypeResults) {
                //$("#ConfirmationType").html(""); // clear before appending new list
                $(ConfirmationTypeObj).html(""); // clear before appending new list

                $.each(confirmationTypeResults,
                    function (i, confirmationTypeResult) {
                        //$("#ConfirmationType")
                        $(ConfirmationTypeObj)
                            .append(
                                $('<option></option>')
                                .val(confirmationTypeResult.Id)
                                .html(confirmationTypeResult.Description));
                    });

                //$('#ConfirmationType').prop('selectedIndex', -1);
                //$('#ConfirmationType').removeAttr('disabled');

                $(ConfirmationTypeObj).prop('selectedIndex', -1);
                $(ConfirmationTypeObj).removeAttr('disabled');

            }

        });
    }

}

function disableConfirmationType() {

    //If commn method is NOT selected, disable confirmation type.
    var contactCommunicationMethodIdValue = document.getElementById('ContactCommunicationMethod').value;
    if (contactCommunicationMethodIdValue == '' || contactCommunicationMethodIdValue == null) {
        document.getElementById("CommunicationMethod").disabled = true;
    } else {
        document.getElementById("CommunicationMethod").disabled = false;
    }

    //If commn method is NOT selected, disable confirmation type.
    var communicationMethodIdValue = document.getElementById('CommunicationMethod').value;
    if (communicationMethodIdValue == '' || communicationMethodIdValue == null) {
        document.getElementById("ConfirmationType").disabled = true;
    } else {
        document.getElementById("ConfirmationType").disabled = false;
    }

    confirmationTypeIdValue = document.getElementById('ConfirmationType').value;
    if (confirmationTypeIdValue == '' || confirmationTypeIdValue == null) {
        document.getElementById("CommunicationReponseType").disabled = true;
        document.getElementById("adaTypeDropdown").disabled = true;

        //toggle the require field validator for "Person Spoken To" and  "Notes" fields
        toggleMandatoryIndicator();

        $("#pcntContactAttemptModal").find("#CommunicationReponseTypeDiv").show();
        $("#pcntContactAttemptModal").find("#pcntContactAttemptAdaDiv").show();
        $("#pcntContactAttemptModal").find("#pcntContactAttemptProviderGenderPreferenceTypeDiv").show();
        $("#pcntContactAttemptModal").find("#pcntContactAttemptChaperoneGenderPreferenceTypeDiv").show();
        $("#pcntContactAttemptModal").find(".linebreakHideOrShow").show();
    } else {
        document.getElementById("CommunicationReponseType").disabled = false;
        document.getElementById("adaTypeDropdown").disabled = false;
        $("#pcntContactAttemptModal").find("#CommunicationReponseTypeDiv").show();
        $("#pcntContactAttemptModal").find("#pcntContactAttemptAdaDiv").show();
        $("#pcntContactAttemptModal").find("#pcntContactAttemptProviderGenderPreferenceTypeDiv").show();
        $("#pcntContactAttemptModal").find("#pcntContactAttemptChaperoneGenderPreferenceTypeDiv").show();
        $("#pcntContactAttemptModal").find(".linebreakHideOrShow").show();
    }
}


function getQueryStringParamValue(paramValue) {
    var pageUrl = window.location.search.substring(1);
    var urlVariables = pageUrl.split('&');
    for (var i = 0; i < urlVariables.length; i++) {

        var sParameterName = urlVariables[i].split('=');
        if (sParameterName[0] == paramValue) {
            return sParameterName[1];
        }
    }

}

//SS 07/28 - User Story 71201
function disableControls() {
    //Disable Communication Method and Communication Type DropDowns
    document.getElementById("CommunicationMethod").disabled = true;
    document.getElementById("ConfirmationType").disabled = true;
    document.getElementById("btnSave").disabled = true;
    document.getElementById("btnCancel").disabled = true;
    document.getElementById("txtPersonName").disabled = true;
    document.getElementById("ContactCommunicationMethod").disabled = true;
    document.getElementById("CommunicationReponseType").disabled = true;
    document.getElementById("adaTypeDropdown").disabled = true;
}

//SS 07/28 - User Story 71201
function enableControls() {
    //Disable Communication Method and Communication Type DropDowns
    document.getElementById("CommunicationMethod").disabled = false;
    document.getElementById("ConfirmationType").disabled = false;
    document.getElementById("btnSave").disabled = false;
    document.getElementById("btnCancel").disabled = false;
    document.getElementById("txtPersonName").disabled = false;
    document.getElementById("ContactCommunicationMethod").disabled = false;
    document.getElementById("CommunicationReponseType").disabled = false;
    document.getElementById("adaTypeDropdown").disabled = false;
}

function resetControls() {
    $("#pcntContactAttemptModal").find('#CommunicationMethod').prop('selectedIndex', -1);
    $("#pcntContactAttemptModal").find('#ConfirmationType').prop('selectedIndex', -1);
    $("#pcntContactAttemptModal").find('#txtPersonName').val("");
    //VA lob
    if (isVALob) {
        $('form[name="confirmationForm"]').find('#ContactCommunicationMethod').prop('selectedIndex', 0);
        $('input[name=ContactId]').val("1"); // set contactid to 1 "Claimant" for va lob only
    }
    else { // non-VA lob
        $('form[name="confirmationForm"]').find('#ContactCommunicationMethod').prop('selectedIndex', -1);
    }

    $("#pcntContactAttemptModal").find('#CommunicationReponseType').prop('selectedIndex', -1);
    disableConfirmationType();
}

// function to toggle the require field validator for "Person Spoken To" and  "Notes" fields
function toggleMandatoryIndicator()
{
    var personContactIdValue = document.getElementById('ContactCommunicationMethod').value;
    //VA LOB
    if (isVALob) {
       // $('#pcntContactAttemptModal').find('.lblRequiredSpokenTo').css({ "color": "#ffff !important" });
        $('#pcntContactAttemptModal').find('.lblRequiredNotes').css({ "color": "#ffff !important" });
    }
    else { // non-VA LOB

        if (personContactIdValue != "1") { // 1-Claimant, 2-Client and 3- Provider
            $('#pcntContactAttemptModal').find('.lblRequiredSpokenTo').css({ "color": "#ff1616 !important" });
            $('#pcntContactAttemptModal').find('.lblRequiredNotes').css({ "color": "#ff1616 !important" });
        }
        else {
           // $('#pcntContactAttemptModal').find('.lblRequiredSpokenTo').css({ "color": "#ffff !important" });
            $('#pcntContactAttemptModal').find('.lblRequiredNotes').css({ "color": "#ffff !important" });
        }
    }

}
//function selectAppointment(val) {
//    $("#divEdit").show();
//    $("#divSave").hide();
//    var chkAppt = document.getElementById(val + "-CHK");
//   // if (chkAppt.checked == true) {
//    //    document.getElementById(val + '-SPAN').style.backgroundColor = '#5bc0de';
//    //    document.getElementById(val + '-SPAN').style.display = 'inline';
//   //}
//    //else {
//        //document.getElementById(val + '-SPAN').style.backgroundColor = 'white';
//        //document.getElementById(val + '-SPAN').style.display = 'none';
//   // }
//}

function selectAll() {
    var inputTag = document.getElementsByTagName("input");
    var chkSelectAll = document.getElementById("ALL-CHK");
    var spanTag = document.getElementsByTagName("span");
    for (var i = 0; i < inputTag.length; i++) {
        if (inputTag[i].type == 'checkbox' && inputTag[i].value != "" && !inputTag[i].disabled) {
            inputTag[i].checked = chkSelectAll.checked;
            //selectAppointment(inputTag[i].value);
            }
        }
}

function removeLastCommaChar(appointmentIds) {
    if (appointmentIds.length > 0) {
        var lastCharacter = appointmentIds.substring(appointmentIds.length - 1, appointmentIds.length);
        if (lastCharacter == ',')
            appointmentIds = appointmentIds.substring(0, appointmentIds.lastIndexOf(','));
    }
    return appointmentIds;
}

function sleep(durationInSeconds) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + durationInSeconds) { /* do nothing */ }
}

function getPositiveContactRules(rules) {
    PositiveContactRules = {};
    var PositiveContactRulesArray = JSON.parse(rules);
    for (var i = 0; i < PositiveContactRulesArray.length; i++) {
        var current = PositiveContactRulesArray[i];
        PositiveContactRules[current.positiveContactRuleId] = current;
    }
    console.log(PositiveContactRules);

}

//close bttn logic for Contact Attempt Modal
function contactAttemptClosebtn() {
    resetControls();
    var contactAttemptErrorContainer = $("#contactAttempt-modal-validation-summary");
    contactAttemptErrorContainer.html("");
    var contactAttemptErrorDiv = $("#div-contactAttemptmodal-error-container");
    contactAttemptErrorDiv.html("");
    $('#SelectedAppointmentListLabel').html('');
}

function CheckAlphaChar(event, prevVal) {
    var currentVal = prevVal + String.fromCharCode(event.which);
    const pattern = new RegExp(/^[^<>@0-9]*$/);
    return pattern.test(currentVal)
} 

function CheckAlphaNumericChar(event, prevVal) {
   var currentVal = prevVal + String.fromCharCode(event.which);
    const pattern = new RegExp(/^[^<>@]*$/);
    return pattern.test(currentVal)
}

function disableCommunicationResponse() {
    document.getElementById("CommunicationReponseType").disabled = true;
    document.getElementById("adaTypeDropdown").disabled = true;
    $("#pcntContactAttemptModal").find("#CommunicationReponseTypeDiv").hide();
    $("#pcntContactAttemptModal").find("#pcntContactAttemptAdaDiv").hide();
    $("#pcntContactAttemptModal").find("#pcntContactAttemptProviderGenderPreferenceTypeDiv").hide();
    $("#pcntContactAttemptModal").find("#pcntContactAttemptChaperoneGenderPreferenceTypeDiv").hide();
    $("#pcntContactAttemptModal").find(".linebreakHideOrShow").hide();

    //toggle the require field validator for "Person Spoken To" and  "Notes" fields
    toggleMandatoryIndicator();
}

//remove the special characters from the Notes field - '@','<','>'
$("#txtContactAttemptNote").bind("paste", function (e) {
    var pastedData = e.originalEvent.clipboardData.getData('text');
    var currNotesData = $("#txtContactAttemptNote").val();
    pastedData = currNotesData + pastedData;
    pastedData = pastedData.replace(/[<>@]/g, '');
    $("#txtContactAttemptNote").val(pastedData);
    return false;
});
//remove the special characters from the Person spoken to field - '@','<','>'
$("#txtPersonName").bind("paste", function (e) {
    var pastedData = e.originalEvent.clipboardData.getData('text');
    var currPersonSpokenToData = $("#txtPersonName").val();
    pastedData = currPersonSpokenToData + pastedData;
    pastedData = pastedData.replace(/[<>@]/g, '');
    $("#txtPersonName").val(pastedData);
    return false;
});

$(document)
    .ready(function () {
        $('.toggle h3').click(function () {
            $('div.panel').slideUp('500');
            var text = $(this).next();

            if (text.is(':hidden')) {
                text.slideDown('500');
            } else {
                text.slideUp('500');
            }

        });

        //resetControls();

        $('#btnCancel').click(function () {
            resetControls();
            var errorMessage1 = $('form[name="undoForm"]').find("#errorMessage1");
            errorMessage1.html("");
            errorMessage1.hide();
        });
      
        $('.btnCaseSelect').click(function () {
            var command = $(this).data("pdsa-action");
            var caseId = $(this).data("pdsa-select");
            var eventCommand = $('form[name="caseForm"]').find("#EventCommand");
            eventCommand.val(command);
            var CaseIdSelected = $('form[name="caseForm"]').find("#CaseIdSelected");
            CaseIdSelected.val(caseId);
            document.getElementById('caseForm').submit();
        });

        $('#btnConfirmApptAdd').click(function () {

            var errorMsg = "";
            var appointmentIds = "";
            var appointmentsToBeEdited = "";
            var claimantId = $("#ClaimantId").val();
            var caseId = $("#CaseId").val();
            $('#SelectedAppointmentListLabel').html('');
            var aa = document.getElementsByTagName("input");
            for (var i = 0; i < aa.length; i++) {
                if (aa[i].type == 'checkbox' && aa[i].checked == true && aa[i].value != "") { 
                    appointmentIds += aa[i].value + ",";
                    appointmentsToBeEdited += claimantId + '.' + caseId + '.' + aa[i].value + ",";
                    if ($("#" + aa[i].value + "-DOA").val() === "True") {
                        hasDOAPassed = $("#" + aa[i].value + "-DOA").val();                    

                    }     
                    if ($("#" + aa[i].value + "-PCNT").val() === 'PCNT') {
                        hasPCNTTracking = "True";
                    }
                }
            }  
             //remove the last comma
            appointmentIds = removeLastCommaChar(appointmentIds);
            document.getElementById('AppointmentIds').value = appointmentIds;
            if (appointmentsToBeEdited != "")
            {
                //remove the last comma from the variable
                appointmentsToBeEdited = removeLastCommaChar(appointmentsToBeEdited);
                //split the values by comma
                var valuesArray = appointmentsToBeEdited.split(',');
                //container for the appointments to be edited
                var container = $('#SelectedAppointmentListLabel');

                $.each(valuesArray, function (index, value) {
                    //span element
                    var spanElement = $('<label class="label label-info Edit"></label>');
                    //set the text of the span element to be the current value
                    spanElement.text(value);
                    //append the span element to the container
                    container.append(spanElement);
                });
            }
                //Checking for appointments selection
                 if (appointmentIds.length == 0) {
                    //If there are appointment only
                    var count = $('#AppointmentCount').val();
                    if (count > 0) {
                        errorMsg = "Please select one or more eligible appointments.";
                    }
                }
            if (errorMsg.length > 0) {
                var errorMessage1 = $('#errorMessage1');
                errorMessage1.html("<span>&nbsp;" + errorMsg + "</span>");
                errorMessage1.show();
                return false;
            }
            else {
                var errorMessage1 = $('#errorMessage1');
                errorMessage1.html('');
                errorMessage1.hide();

            }
            isCnfrmApptModal = true;

            return true;
            });


        $('#btnSaveUndo').click(function () {

            var undoReasonPatternMatch = /^[\s\S]{10,}$/; //Check to see if undo reason has at least 10 character(s)
            var undoReasonNotes = document.getElementById("UndoReason").value.trim();

            if (!undoReasonNotes.match(undoReasonPatternMatch)) {
                $('.modalerror').show();
                return false;
            }

            var command = $(this).data("pdsa-action");
            var eventCommand = $('form[name="undoForm"]').find("#EventCommand");
            eventCommand.val(command);
            $('form[name="undoForm"]').find("#PcntId").val(positiveConfirmationIdValue);
            $('form[name="undoForm"]').find("#AppointmentId").val(appointmentIdValue);
            return true;
        });

        $('#myModal')
            .on('show.bs.modal',
                function (event) {
                    var button = $(event.relatedTarget); // Button that triggered the modal
                    var postiveConfirmationId = button.data('whatever'); // Extract info from data-* attributes
                    positiveConfirmationIdValue = postiveConfirmationId;
                    var apptId = button.data('appointmentid');// Extract info from data-* attributes
                    appointmentIdValue = apptId;
                });

        //Reset modal after hiding
        $('#myModal')
        .on('hide.bs.modal',
            function (e) {
                $("#UndoReason").val("");
                $('.modalerror').hide();
            });

        $('#pcntNoteModal')
        .on('show.bs.modal',
            function (event) {
                var button = $(event.relatedTarget); // Button that triggered the modal               
                var noteToDisplay = button.data('displaynote');
                $("#pcntNoteModal").find("#txtAreaPcntNote").val(noteToDisplay);
            });

        $('#pcntNoteModal')
               .on('hide.bs.modal',
                   function (event) {
                       $("#pcntNoteModal").find("#txtAreaPcntNote").val();
                   });

         
      $('#pcntContactAttemptModal')
      .on('show.bs.modal',
          function (event) {
              //setting the Modal Title as Appointment Details or Contact Attempt
              if (isCnfrmApptModal) {
                  var positiveContactApptRules = $("#PositiveContactRulesApptLevelJsModel").val();
                  getPositiveContactRules(positiveContactApptRules);
                  var htmLContent = $('#pcntContactAttemptModal .modal-header h1').html();
                  htmLContent = htmLContent.replace('Contact Attempt', 'Appointment Details');
                  $('#pcntContactAttemptModal .modal-header h1').html(htmLContent);
                  $('#pcntContactAttemptModal .modal-header h1 i').removeClass('fa-folder-open-o');
                  $('#pcntContactAttemptModal .modal-header h1 i').addClass('fa-calendar-check-o');
                  resetControls();
                  $("#divAppointmentList").show();

              }
              else {
                  var positiveContactCaseRules = $("#PositiveContactRulesCaseLevelJsModel").val();
                  getPositiveContactRules(positiveContactCaseRules);
                  var htmLContent = $('#pcntContactAttemptModal .modal-header h1').html();
                  htmLContent = htmLContent.replace('Appointment Details', 'Contact Attempt');
                  $('#pcntContactAttemptModal .modal-header h1').html(htmLContent);
                  $('#pcntContactAttemptModal .modal-header h1 i').removeClass('fa-calendar-check-o');
                  $('#pcntContactAttemptModal .modal-header h1 i').addClass('fa-folder-open-o');
                  resetControls();
                  $("#divAppointmentList").hide();
              }
          });

        $('#pcntContactAttemptModal')
               .on('hide.bs.modal',
            function (event)
            {
                isCnfrmApptModal = false;
                //$("#pcntContactAttemptModal").find("select#CommunicationMethod").empty();
                $("#pcntContactAttemptModal").find("select#ConfirmationType").empty();
                $("#pcntContactAttemptModal").find("select#CommunicationReponseType").empty();
                $("#pcntContactAttemptModal").find("#txtPersonName").val('');
                $("#pcntContactAttemptModal").find("#txtContactAttemptNote").val('');
                $("#pcntContactAttemptModal").find("#CommunicationReponseTypeDiv").show();
                $("#pcntContactAttemptModal").find("#pcntContactAttemptAdaDiv").show();
                $("#pcntContactAttemptModal").find("#pcntContactAttemptProviderGenderPreferenceTypeDiv").show();
                $("#pcntContactAttemptModal").find("#pcntContactAttemptChaperoneGenderPreferenceTypeDiv").show();
                $("#pcntContactAttemptModal").find(".linebreakHideOrShow").show();
                $("#divAppointmentList").hide();
             });


        $('#btnContactAttempSave').click(function () {
            //error div
            errorMsg = []; //var errorMsg = "";
            var contactAttemptErrorContainer = $("#contactAttempt-modal-validation-summary");
            contactAttemptErrorContainer.html("");
            var contactAttemptErrorDiv = $("#div-contactAttemptmodal-error-container");
            contactAttemptErrorDiv.html("");
            //response fields
            var personContactedId = $('#ContactCommunicationMethod').val();
            var communicationMethodId = $('#CommunicationMethod').val();
            var confirmationTypeId = $('#ConfirmationType').val();
            var communicationReponse = $('#CommunicationReponseType').val();
            var personSpokenTo = $('#txtPersonName').val().trim();
            var notes = $('#txtContactAttemptNote').val().trim();
            var communicationReponseType = $('#CommunicationReponseType option:selected').text();
            var communicationMethodType = $('#CommunicationMethod option:selected').text();
            var personSpokenToPatternMatch = /^[\s\S]{5,}$/; //Check to see if person spoken to has at least 5 character(s)
            var notePatternMatch = /^[\s\S]{10,}$/;
            var isConfirmTypeDisabled = document.getElementById("ConfirmationType").disabled;
            var isCommunicationResponseDisabled = document.getElementById("CommunicationReponseType").disabled;
           
            //Contact dropdown validation
            if (personContactedId == null || personContactedId <= -1) {
                errorMsg.push('<li style="color: red">Please select Person Contacted.</li>');
            }
            //Communication dropwdown validation
            else if (communicationMethodId == null || communicationMethodId <= -1) {
                errorMsg.push('<li style="color: red">Please select Communication Method.</li>');
            }
            //confirmation type validation
            else if ((confirmationTypeId == null || confirmationTypeId <= -1) && !isConfirmTypeDisabled) {
                errorMsg.push('<li style="color: red">Please select Confirmation Type.</li>');
            }
            //Communication Response validation - if person contacted is "claimant" and communication type is "phone/verbal" and if confirmation type is "Spoken to"
            //else if (personContactedId == 1 && communicationMethodId == 1 && confirmationTypeId == 65 && (communicationReponse == null || communicationReponse <= -1)) {
            else if (!isCommunicationResponseDisabled && (communicationReponse == null || communicationReponse <= -1)) {
                errorMsg.push('<li style="color: red">Please select Communication Response.</li>');
            }
            //Person Spoken To validation
            //if confirmation type is not email received and communication response is enabled
            //If at appt level and confirmation type is confirmed spoken to is required
            if ((((isCnfrmApptModal && confirmationTypeId == 1) || !isCommunicationResponseDisabled && confirmationTypeId != 86) && ((personSpokenTo == null || personSpokenTo == "") || (!personSpokenTo.match(personSpokenToPatternMatch))))
                || ((personSpokenTo.length > 0) && !personSpokenTo.match(personSpokenToPatternMatch)))
            {
                errorMsg.push('<li style="color: red">Person Spoken To requires at least 5 characters.</li>');
            }
            else if ((personSpokenTo == null || personSpokenTo == "") || (!personSpokenTo.match(personSpokenToPatternMatch))) { // Adding validation for Person contact Id 2-Client,  3-Provider and empty
                errorMsg.push('<li style="color: red">Person Spoken To requires at least 5 characters.</li>');
            }
            //notes validation - min required 10 characters
            if ((((isCnfrmApptModal && confirmationTypeId == 1) || !isCommunicationResponseDisabled) && ((notes == null || notes == "") || notes.length < 10))
                || ((notes.length > 0) && !notes.match(notePatternMatch)))
            {
                errorMsg.push('<li style="color: red">Notes requires at least 10 characters.</li>');
            }
            else if (personContactedId != "1" && ((notes == null || notes == "") || notes.length < 10)) { // Adding validation for Person contact Id 2-Client,  3-Provider and empty
                errorMsg.push('<li style="color: red">Notes requires at least 10 characters.</li>');
            }
          
            if (personContactedId == "1" && (hasDOAPassed || hasPCNTTracking ) && !isVALob) {
                 errorMsg.push('<li style="color: red">Tracking is not allowed on appointments with DOA in the past or PCNT is tracked.</li>' );
            }

            if (errorMsg.length > 0) {
                 contactAttemptErrorDiv.html(errorMsg);
                contactAttemptErrorContainer.show();
                return false;
            }

            // Show spinner and block the modal to prevent mulitple click on save button
            $('form#confirmationForm').submit(function (e) {
                var form = this;
                e.preventDefault();
                $('.page-overlay').show();
                $('.spinner').show();
                  setTimeout(function () {
                      form.submit();
                  }, 2000); // 2 second delay
            });
        });
    });
