var diagSubmitVA = (function () {

    let searchTerms = [];
    const LAB_SEARCH_TERMS = {
		Quest: {
			numericalFlags: {
				suffixes: ["H", "L"],
				format: "\\b\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?\\s*[\\(]?({SUFFIXES})[\\)]?\\b"
			},
			keywords: ["Trace"]
		},
		LabCorp: {
			numericalFlags: {
				suffixes: ["High", "Low"],
				format: "\\b\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?\\s*[\\(]?({SUFFIXES})[\\)]?\\b"
			},
			keywords: ["Abnormal"]
		}
	};

    // Document type validation and file selection
    function docTypeChangeEvent() {
        var isDocTypeSelected = $("#doctype_id").val() != 0;
        $("#file").prop("disabled", !isDocTypeSelected);
        $('#Submit').toggleClass("disabled", !isDocTypeSelected);
        $('#file').off("change").on("change", onFileSelect);
    }

    // Reset the submit window
    function resetSubmitWindow() {
        $("#waiting-msg").hide();
        $("#file").val("").prop("disabled", false);
        $("#Submit, #Cancel, #doctype_id").prop("disabled", false);
        $("#doctype_id").change();
    }

    // Extract text from PDF using pdf.js
    function extractTextFromPdf(file, callback) {
        var reader = new FileReader();
        var resObj = {
            is201Exists: false,
            imgCount: 0,
            fullText: ''
        };

        reader.onload = function (e) {
            var arrayBuffer = e.target.result;
            if (!pdfjsLib || typeof pdfjsLib.getDocument !== "function") {
                console.error("pdfjsLib is not loaded or does not have getDocument.");
                return;
            }

            pdfjsLib.getDocument({ data: arrayBuffer }).promise.then(function (pdf) {
                var numPages = pdf.numPages;
                var pageNum = 1;

                var validate201Content = function (page) {
                    var defer = $.Deferred();
                
                    processPage(pdf, page).then(function (result) {
                        const pageText = result.text;
                        const imageCount = result.imageCount; 
                        
                        resObj.imgCount += imageCount; // Accumulate image count
                        //alert("count in extraction: " + resObj.imgCount);
                        // Read and validate the content for 201
                        resObj.is201Exists = validatePDFContentAgainstSearchTerms(pageText);
                        resObj.fullText += pageText + '\n'; // Append page text
                                
                        if (resObj.is201Exists) {
                            return defer.resolve(resObj);
                        }
                
                        pageNum = pageNum + 1;

                        if (pageNum <= numPages) {
                            validate201Content(pageNum);
                        } else {
                            return defer.resolve(resObj);
                        }
                
                        return defer.promise();
                    }).then(function (obj) {
                        callback(obj.is201Exists, obj.fullText, obj.imgCount);
                    });
                }
                
                validate201Content(pageNum);

            }).catch(function (error) {
                console.error("Error getting document:", error);
            });
        };

        reader.readAsArrayBuffer(file);
    }

    // Validate the page content aginst the search terms
    function validatePDFContentAgainstSearchTerms(pageText) {
       let is201exists = false;
       pageText = pageText.toLowerCase();
       
        searchTerms.forEach(function (term) {
            var matched = pageText.match(term);
            if (matched != null && matched.length > 0) 
                is201exists = true;            
       });
       return is201exists;
    }

    function processPage(pdf, pageNum) {
        var defer = $.Deferred();
    
        pdf.getPage(pageNum).then(function (page) {
            // Get both text content and operator list (for images)
            return Promise.all([
                page.getTextContent(),
                page.getOperatorList()
            ]).then(function ([textContent, ops]) {
                // Extract text
                var pageText = textContent.items.map(function (item) { return item.str; }).join(" ");
    
                // Check for image operations
                const imageOps = [
                    pdfjsLib.OPS.paintImageXObject,
                    pdfjsLib.OPS.paintImageXObjectRepeat,
                    pdfjsLib.OPS.paintJpegXObject
                ];
    
                // Count the images by filtering for image-related operations
                var imageCount = ops.fnArray.filter(function (op) {
                    return imageOps.indexOf(op) !== -1;
                }).length;
    
                // Return both the text and the image count
                defer.resolve({ text: pageText, imageCount: imageCount });
            });
        });
    
        return defer.promise();
    }

    // File select handler
    function onFileSelect(evt) {
        var fileInput = evt.target;
        var selectedFile = fileInput.value;
        if (selectedFile !== "" && selectedFile.toUpperCase().indexOf('.PDF') === -1) {
            alert("You can only select a .pdf file.");
            resetSubmitWindow();
            return;
        }

        // Validate file size (max 30 MB)
        var maxMBLimit = 30;
        var file = fileInput.files[0];
        var fileSizeInMB = Math.ceil(file.size / (1024 * 1024));

        if (fileSizeInMB > maxMBLimit) {
            window.alert("The file size exceeds the allowable limit of 30 MB. Please try again with a smaller file size.");
            resetSubmitWindow();
            return false;
        }

        var file_name = $("#filePath").val() + "_D.pdf";
        window.opener.mainVA.setPdfFile(file_name);

        // Load the search terms from the json file
        getSearchTerms(file);        
    }

    // Handle append condition and file processing
    function handleAppendCondition(pdfText, imageCount) {
        var docStatus = $("#docStatus").val();

        if (docStatus === "Append" && !window.confirm("File already exists for " + $("#account_id").val() + ". Do you want to append?")) {
                resetSubmitWindow();
                return;
        }

        postFileForProcessing(pdfText, imageCount);
    }

    // Show or hide waiting message
    function displayWaitingMsg(show) {
        $("#waiting-msg").toggle(show);
        $("#Submit").toggleClass("disabled", show);
        $("#Cancel, #file, #doctype_id").prop("disabled", show);
    }

    // Update tracking info
    function updateTracking(abnormalities) {
		var abnormaltiesFound = abnormalities.length > 0;
        var queryStr = "file_name=" + $("#filePath").val() +
            "&quadis_id=" + $("#account_id").val() +
            "&asp_file=Diag";
			if (abnormaltiesFound) {
				queryStr += "&abn_found=Y";
			}

        $.post("tracking.asp?" + queryStr).fail(function (obj) {
            var errorLog = "Error Status: " + obj.status + ", Error Message: " + obj.statusText;
            postErrorLog($("#account_id").val() + "_document.pdf", $("#account_id").val(), "docStatus", "DIAG", errorLog);
        });
    }

    // Post the file for processing
    function postFileForProcessing(pdfText, imageCount) {
        displayWaitingMsg(true);

        // Validate the abnormalities
        var abnormalities = handleAbnormalities(pdfText);

        var cmd = $("#docStatus").val().toLowerCase();
        var qId = $("#account_id").val();
        var fPath = $("#filePath").val();
        var docStatus = $("#docStatus").val();
        var fType = $("#doctype_id").val();

        // remove the account number from the path
        fPath = fPath.replace(qId, "");
        // Construct the file name with the path
        var fileName = fPath + "\\" + qId + "_" + fType + ".pdf";
        fileName = fileName.split("\\").join("\\\\");

        // constructing the query string
        var queryStr = "cmd=" + cmd + "&asp_file=DIAG&docType=" + fType;
        queryStr += "&quadis_id=" + qId + "&file_path=" + fPath + "&pdf_file=" + fileName + "&doc_status=" + docStatus;

        var file = document.getElementById("file").files[0];
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "process-pdf-files.asp?" + queryStr, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                displayWaitingMsg(false);
                $("#file").val("");
                var response = xhr.responseText.split(":")[0];
                if (response === "FAIL") {
                    alert(xhr.responseText.split(":")[1] || "Unknown error");
                    return;
                }

                if(imageCount)
                    createCaseNote();

				updateTracking(abnormalities);
				logAbnormalities(abnormalities);
				
                window.opener.mainVA.changeToAppend();
                if ($("#docStatus").val().toLowerCase() !== "append") {
                    window.opener.mainVA.afterScan();
                    alert("Successfully imported.");
                    window.close();
                }
            }
        };
        var formData = new FormData();
        formData.append("commonFile", file);
        xhr.send(formData);
    }

    // Retrieve the serach terms from the json file
    function getSearchTerms(file) {
        // Display the wait message
        displayWaitingMsg(true);

        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'Json/searchTerms.json', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let jsonObject =  JSON.parse(xhr.responseText);
                searchTerms = jsonObject.terms.map(function (item) { return new RegExp(item.toString().toLowerCase(), "gi"); }); 
                extractTextFromPdf(file, handle201Validation);               
            }
        };
        xhr.send();
    }

    function handle201Validation(contentExists, fullText, imageCount){    
        if (contentExists) {
            alert("The uploaded file contains 201 contents, and this file will not be imported or appended. Please remove the 201 contents first and upload the file again.");
            resetSubmitWindow();
            return false;
        } 
        
        // PDF image count validation - addition for the 201 validation
        if (imageCount > 0 && !window.confirm("User has acknowledged that 201 contents are unavailable for the <selected classification> diagnosis. Click OK to continue.")) {
            resetSubmitWindow();
            return false;
        }
        
        handleAppendCondition(fullText, imageCount);
    }
    
    // After extracting text, detect and handle abnormalities
    function handleAbnormalities(pdfText) {
        var abnormalities = detectLabAbnormalities(pdfText);
        if (abnormalities.length > 0) {
            //console.log("Abnormalities found:", abnormalities);
            alert("abnormalities detected ".toString()); //Found ${abnormalities.length} abnormalities in the PDF.`);
        } else {
            console.log("No abnormalities detected.");
            alert("No abnormalities detected in the PDF.");
        }
		return abnormalities;
    }

    // Main function to detect abnormalities based on the extracted text and pre-defined search terms for Quest and LabCorp
    function detectLabAbnormalities(pdfText) {
        let labType = /Quest/i.test(pdfText) ? "Quest" : (/LabCorp/i.test(pdfText) ? "LabCorp" : "Quest");
        let terms = LAB_SEARCH_TERMS[labType];
        var abnormalities = [];

        if (!terms) {
            console.warn("Lab type not detected or supported.");
            return abnormalities;
        }

        if (terms.numericalFlags && terms.numericalFlags.suffixes && terms.numericalFlags.format) {
			var suffixPattern = terms.numericalFlags.suffixes
				.map(function(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); })
				.join('|');
			var pattern = terms.numericalFlags.format.replace("{SUFFIXES}", suffixPattern);
			var numericalRegex = new RegExp(pattern, "gi");
			var numericalMatches = pdfText.match(numericalRegex) || [];
			numericalMatches.forEach(function(match) {
				abnormalities.push("Numerical flag found: " + match);
			});
			
		}

		// Check for keywords
		if (terms.keywords && terms.keywords.length > 0) {
			var keywordRegex = new RegExp("\\b(" + terms.keywords.join('|') + ")\\b", "gi");
			var keywordMatches = pdfText.match(keywordRegex) || [];
			keywordMatches.forEach(function(match) {
				abnormalities.push("Keyword found: " + match);
			});
		}

        return abnormalities;
    }
	
	// Update tracking info
    function logAbnormalities(abnormalities) {
		var infoLog = "Found " + abnormalities.length + " abnormalities in the PDF. " + ", Detected abnormalities list: " + abnormalities;
        postInfoLog($("#account_id").val() + "_document.pdf", $("#account_id").val(), "docStatus", "DIAG", infoLog);
    }

    // Add case note for the user's consent
    function createCaseNote() {
        var queryStr = "quadis_id=" + $("#account_id").val() +
                    "&c_note_type=201CONSENT" + 
                    "&note=User has acknowledged that 201 contents are unavailable for the <selected classification> diagnosis.";
        $.post("include/efm_casenote.asp?" + queryStr)
        .done(function (response) {
            console.log("Server Response:", response);
            //alert("Case note added successfully!");
        }).fail(function (obj) {
            //alert("case note adding failed");
        });
    }
    return {
        updateTracking: updateTracking,
        displayWaitingMsg: displayWaitingMsg,
        resetSubmitWindow: resetSubmitWindow,
        docTypeChangeEvent: docTypeChangeEvent,
		handleAbnormalities: handleAbnormalities,
		detectLabAbnormalities: detectLabAbnormalities,
        createCaseNote: createCaseNote

    };

})();
