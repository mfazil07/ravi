module.exports = function (config) {
    config.set({
      basePath: '',
      frameworks: ['jasmine', '@angular-devkit/build-angular'],
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter'),
        require('karma-coverage')
      ],
      client: {
        clearContext: false // leave Jasmine Spec Runner output visible in browser
      },
      jasmineHtmlReporter: {
        suppressAll: true // removes the duplicated traces
      },
      coverageReporter: {
        dir: require('path').join(__dirname, './coverage/weather-notification-app'),
        subdir: '.',
        reporters: [
          { type: 'html' },
          { type: 'text-summary' } // Add this to get summary in console
        ]
      },
      reporters: ['progress', 'kjhtml'], // Ensure 'progress' is included
      port: 9876,
      colors: true,
      logLevel: config.LOG_DEBUG,
      autoWatch: true,
      browsers: ['Chrome'],
      singleRun: true,
      restartOnFileChange: true,
      files: [
        { pattern: 'src/**/*.ts', included: false, served: true, watched: true } // Include all source files
      ]
    });
  };
