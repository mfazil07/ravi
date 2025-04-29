<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Keyword Scanner (IE Mode)</title>

    <!-- Polyfills for IE -->
    <script src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@babel/polyfill@7.12.1/dist/polyfill.min.js"></script>

    <!-- Legacy PDF.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.943/pdf.min.js"></script>

    <!-- Tesseract.js (may still not work perfectly in IE) -->
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js"></script>

    <style>
        canvas {
            display: block;
            margin-top: 20px;
            border: 1px solid #ccc;
        }
    </style>
</head>
<body>

    <h2>PDF Keyword Scanner</h2>
    <input type="file" id="pdf-upload" accept="application/pdf" />
    <input type="text" id="keyword-input" placeholder="Enter keyword to search..." />
    <button id="scan-btn">Scan PDF</button>
    <p id="result"></p>
    <canvas id="pdf-canvas"></canvas>

    <script>
        document.getElementById("scan-btn").addEventListener("click", function () {
            var fileInput = document.getElementById("pdf-upload");
            var keyword = document.getElementById("keyword-input").value.trim();
            var resultElement = document.getElementById("result");

            if (!fileInput.files[0]) {
                resultElement.innerText = "Please upload a PDF.";
                return;
            }
            if (!keyword) {
                resultElement.innerText = "Please enter a keyword to search.";
                return;
            }

            var file = fileInput.files[0];
            var fileReader = new FileReader();

            fileReader.onload = function () {
                var typedarray = new Uint8Array(fileReader.result);
                pdfjsLib.getDocument({ data: typedarray }).promise.then(function (pdf) {
                    var canvas = document.getElementById("pdf-canvas");
                    var context = canvas.getContext("2d");
                    var scale = 1.5;
                    var found = false;

                    var processPage = function (pageNum) {
                        if (pageNum > pdf.numPages) {
                            if (!found) {
                                resultElement.innerText = '❌ Keyword "' + keyword + '" not found.';
                            }
                            return;
                        }

                        pdf.getPage(pageNum).then(function (page) {
                            var viewport = page.getViewport(scale);
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;

                            var renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            };

                            page.render(renderContext).promise.then(function () {
                                resultElement.innerText = "Scanning page " + pageNum + "...";
                                var imageDataUrl = canvas.toDataURL();

                                Tesseract.recognize(imageDataUrl, 'eng').then(function (result) {
                                    var text = result.data.text;
                                    if (text.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
                                        resultElement.innerText = '✅ Keyword "' + keyword + '" found on page ' + pageNum + '.';
                                        found = true;
                                    } else {
                                        processPage(pageNum + 1);
                                    }
                                }).catch(function (err) {
                                    resultElement.innerText = "OCR error: " + err.message;
                                });
                            });
                        });
                    };

                    processPage(1);
                }).catch(function (error) {
                    resultElement.innerText = "Error loading PDF: " + error.message;
                });
            };

            fileReader.readAsArrayBuffer(file);
        });
    </script>

</body>
</html>
