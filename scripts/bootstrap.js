'use strict';

var angular = require('angular');
var $ = require('jquery');
var _ = require('lodash/string');

$(function() {
  // Try bootstrapping the app with embedded defaults if it exists
  var embeddedDefaults = window.$$embeddedDefaults;
  var pathname = window.location.pathname;

  if (!_.endsWith(pathname, '/')) {
    pathname += '/';
  }

  var url = pathname + 'config/defaults.json';

  if (embeddedDefaults) {
    bootstrap(embeddedDefaults);
  } else {
    $.getJSON(url).done(bootstrap).fail(function(error) {
      console.error('Failed to load defaults.json from', url);
      console.error(error);
    });
  }

  /**
   * Bootstrap the application
   * @param {object} defaults - The defaults object
   * @return {undefined}
  */
  function bootstrap(defaults) {
    window.SwaggerEditor.$defaults = defaults;

    SwaggerEditor.run(function($templateCache) {
      // require all templates
      $templateCache.put('templates/about.html',
        require('templates/about.html'));

      $templateCache.put('templates/error-presenter.html',
        require('templates/error-presenter.html'));

      $templateCache.put('templates/file-import.html',
        require('templates/file-import.html'));

      $templateCache.put('templates/import.html',
        require('templates/import.html'));

      $templateCache.put('templates/intro.html',
        require('templates/intro.html'));

      $templateCache.put('templates/open-examples.html',
        require('templates/open-examples.html'));

      $templateCache.put('templates/path.html',
        require('templates/path.html'));

      $templateCache.put('templates/releases.html',
        require('templates/releases.html'));

      $templateCache.put('templates/stemcells.html',
        require('templates/stemcells.html'));

      $templateCache.put('templates/update-block.html',
        require('templates/update-block.html'));

      $templateCache.put('templates/choose-mode.html',
        require('templates/choose-mode.html'));

      $templateCache.put('templates/preferences.html',
        require('templates/preferences.html'));

      $templateCache.put('templates/reset-editor.html',
        require('templates/reset-editor.html'));

      $templateCache.put('templates/schema-model.html',
        require('templates/schema-model.html'));

      $templateCache.put('templates/specs-info.html',
        require('templates/specs-info.html'));

      $templateCache.put('templates/tags.html',
        require('templates/tags.html'));

      $templateCache.put('templates/url-import.html',
        require('templates/url-import.html'));
    });

    angular.bootstrap(window.document, ['SwaggerEditor']);
  }
});
