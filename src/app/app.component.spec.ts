<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <!-- Polyfills for IE11 -->
    <script src="https://cdn.jsdelivr.net/npm/es6-promise/dist/es6-promise.auto.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/whatwg-fetch/dist/fetch.umd.js"></script>

    <!-- PDF.js and Tesseract.js -->
    <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/dist/tesseract.min.js"></script>

</head>
<body>

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
            var typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument({ data: typedarray }).promise.then(function (pdf) {
                var canvas = document.getElementById("pdf-canvas");
                var context = canvas.getContext("2d");
                var scale = 2;
                var found = false;
                var pagePromises = [];
    
                function scanPage(pageNum) {
                    return pdf.getPage(pageNum).then(function (page) {
                        var viewport = page.getViewport({ scale: scale });
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
    
                        return page.render({ canvasContext: context, viewport: viewport }).promise.then(function () {
                            var imageDataUrl = canvas.toDataURL();
                            resultElement.innerText = "Scanning page " + pageNum + "...";
    
                            return Tesseract.recognize(imageDataUrl, 'eng').then(function (result) {
                                var text = result.data.text;
                                console.log("Page " + pageNum + " text:\n", text);
    
                                if (text.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
                                    resultElement.innerText = "✅ Keyword \"" + keyword + "\" found on page " + pageNum + ".";
                                    found = true;
                                }
                            });
                        });
                    });
                }
    
                for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    pagePromises.push(scanPage(pageNum));
                }
    
                Promise.all(pagePromises).then(function () {
                    if (!found) {
                        resultElement.innerText = "❌ Keyword \"" + keyword + "\" not found in the document.";
                    }
                });
            });
        };
    
        fileReader.readAsArrayBuffer(file);
    });
    </script>
</body>
</html>
