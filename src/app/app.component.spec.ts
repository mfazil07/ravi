<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/dist/tesseract.min.js"></script>

    <!-- Polyfill for IE compatibility -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/es6-promise/4.2.8/es6-promise.auto.min.js"></script>
</head>
<body>

    <input type="file" id="pdf-upload" accept="application/pdf" />
    <input type="text" id="keyword-input" placeholder="Enter keyword to search..." />
    <button id="scan-btn">Scan PDF</button>
    <p id="result"></p>
    <canvas id="pdf-canvas"></canvas>

    <script>
        // Helper function to mimic async/await using Promises
        function asyncWrapper(generatorFunction) {
            var generator = generatorFunction();

            function handle(result) {
                if (result.done) return Promise.resolve(result.value);
                return Promise.resolve(result.value).then(
                    function (res) { return handle(generator.next(res)); },
                    function (err) { return handle(generator.throw(err)); }
                );
            }

            try {
                return handle(generator.next());
            } catch (ex) {
                return Promise.reject(ex);
            }
        }

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

                asyncWrapper(function* () {
                    var pdf = yield pdfjsLib.getDocument({ data: typedarray }).promise;
                    var canvas = document.getElementById("pdf-canvas");
                    var context = canvas.getContext("2d");
                    var scale = 2;
                    var found = false;

                    for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        var page = yield pdf.getPage(pageNum);
                        var viewport = page.getViewport({ scale: scale });

                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        yield page.render({ canvasContext: context, viewport: viewport }).promise;

                        var imageDataUrl = canvas.toDataURL();

                        resultElement.innerText = "Scanning page " + pageNum + "...";

                        Tesseract.recognize(imageDataUrl, 'eng').then(function (result) {
                            var text = result.data.text;
                            console.log("Page " + pageNum + " text:\n", text);

                            if (text.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
                                resultElement.innerText = "✅ Keyword \"" + keyword + "\" found on page " + pageNum + ".";
                                found = true;
                                return;
                            }
                        });

                        if (found) break;
                    }

                    if (!found) {
                        resultElement.innerText = "❌ Keyword \"" + keyword + "\" not found in the document.";
                    }
                });
            };

            fileReader.readAsArrayBuffer(file);
        });
    </script>

</body>
</html>
