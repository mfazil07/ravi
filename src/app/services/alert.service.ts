function processPage(pdf, pageNum) {
    var defer = $.Deferred();

    pdf.getPage(pageNum).then(function (page) {
        var scale = 1.5; // Adjust scale if needed
        var viewport = page.getViewport({ scale: scale });

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        var renderTask = page.render(renderContext);

        renderTask.promise.then(function () {
            var imageDataUrl = canvas.toDataURL();

            Tesseract.recognize(imageDataUrl, 'eng')
                .then(function (result) {
                    defer.resolve(result.data.text);
                })
                .catch(function (err) {
                    defer.reject(err);
                });
        }).catch(function (err) {
            defer.reject(err);
        });

    }).catch(function (error) {
        defer.reject(error);
    });

    return defer.promise();
}
