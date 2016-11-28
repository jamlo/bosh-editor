'use strict';

SwaggerEditor.controller('HeaderCtrl', function HeaderCtrl($scope, $uibModal,
  $stateParams, $state, $rootScope, Storage, Builder, FileLoader,
  Editor, Preferences, YAML, defaults, strings, $localStorage) {
  $scope.autocompleteMode = Preferences.get('autoCompleteMode');

  Preferences.onChange(function() {
    renderMode(Preferences.get('autoCompleteMode'));
  });

  if ($stateParams.path) {
    $scope.breadcrumbs = [{active: true, name: $stateParams.path}];
  } else {
    $scope.breadcrumbs = [];
  }

  // var statusTimeout;
  $rootScope.$watch('progressStatus', function(progressStatus) {
    var status = strings.stausMessages[progressStatus];
    var statusClass = null;

    if (/success/.test(progressStatus)) {
      statusClass = 'success';
    }

    if (/error/.test(progressStatus)) {
      statusClass = 'error';
    }

    if (/working/.test(progressStatus)) {
      statusClass = 'working';
    }

    $scope.status = status;
    $scope.statusClass = statusClass;
  });

  // Show the intro if it's first time visit
  $localStorage.$default({
    showIntro: !defaults.disableNewUserIntro
  });
  $rootScope.showAbout = $localStorage.showIntro;

  $scope.showFileMenu = function() {
    return !defaults.disableFileMenu;
  };

  $scope.showHeaderBranding = function() {
    return defaults.headerBranding;
  };

  $scope.newProject = function() {
    FileLoader.loadFromUrl('spec-files/guide.yml').then(function(value) {
      $rootScope.editorValue = value;
      Storage.save('yaml', value);
      $state.go('home', {tags: null});
    });
  };

  $scope.onFileMenuOpen = function() {
    assignDownloadHrefs();
    $rootScope.$broadcast('toggleWatchers', false);
  };

  $scope.openImportFile = function() {
    $uibModal.open({
      template: require('templates/file-import.html'),
      controller: 'FileImportCtrl',
      size: 'large'
    });
  };

  $scope.openImportUrl = function() {
    $uibModal.open({
      template: require('templates/url-import.html'),
      controller: 'UrlImportCtrl',
      size: 'large'
    });
  };

  $scope.openAbout = function() {
    $uibModal.open({
      template: require('templates/about.html'),
      size: 'large',
      controller: 'ModalCtrl'
    });
  };

  $rootScope.toggleAboutEditor = function(value) {
    $rootScope.showAbout = value;
    $localStorage.showIntro = value;
  };

  $scope.openEditorPreferences = Editor.showSettings;
  $scope.resetSettings = function() {
    $uibModal.open({
      template: require('templates/reset-editor.html'),
      controller: 'ConfirmReset',
      size: 'large'
    });
  };
  $scope.adjustFontSize = Editor.adjustFontSize;

  $scope.openExamples = function() {
    $uibModal.open({
      template: require('templates/open-examples.html'),
      controller: 'OpenExamplesCtrl',
      size: 'large'
    });
  };

  $scope.chooseMode = function() {
    $uibModal.open({
      template: require('templates/choose-mode.html'),
      controller: 'ChooseModeCtrl',
      size: 'large'
    });
  };

  $scope.openPreferences = function() {
    $uibModal.open({
      template: require('templates/preferences.html'),
      controller: 'PreferencesCtrl',
      size: 'large'
    });
  };

  $scope.isLiveRenderEnabled = function() {
    return Boolean(Preferences).get('liveRender');
  };

  /**
   * Render Chosen Mode
   * @param {String} mode to be rendered
   */
  function renderMode(mode) {
    $scope.autocompleteMode = mode;
  }

  /** */
  function assignDownloadHrefs() {
    var MIME_TYPE = 'text/plain';

    var yaml = $rootScope.editorValue;
    YAML.load(yaml, function(error, json) {
      // Don't assign if there is an error
      if (error) {
        return;
      }

      // if `yaml` is JSON, convert it to YAML
      var jsonParseError = null;
      try {
        JSON.parse(yaml);
      } catch (error) {
        jsonParseError = error;
      }

      var assign = function(yaml, json) {
        json = JSON.stringify(json, null, 4);
        var jsonBlob = new Blob([json], {type: MIME_TYPE});
        $scope.jsonDownloadHref = window.URL.createObjectURL(jsonBlob);
        $scope.jsonDownloadUrl = [
          MIME_TYPE,
          'swagger.json',
          $scope.jsonDownloadHref
        ].join(':');

        // YAML
        var yamlBlob = new Blob([yaml], {type: MIME_TYPE});
        $scope.yamlDownloadHref = window.URL.createObjectURL(yamlBlob);
        $scope.yamlDownloadUrl = [
          MIME_TYPE,
          'bosh-editor.yaml',
          $scope.yamlDownloadHref
        ].join(':');
      };

      if (jsonParseError) {
        assign(yaml, json);
      } else {
        YAML.dump(json, function(error, yamlStr) {
          assign(yamlStr, json);
        });
      }
    });
  }

  $scope.capitalizeGeneratorName = function(name) {
    var names = {
      'jaxrs': 'JAX-RS',
      'nodejs-server': 'Node.js',
      'scalatra': 'Scalatra',
      'spring-mvc': 'Spring MVC',
      'android': 'Android',
      'async-scala': 'Async Scala',
      'csharp': 'C#',
      'CsharpDotNet2': 'C# .NET 2.0',
      'qt5cpp': 'Qt 5 C++',
      'java': 'Java',
      'objc': 'Objective-C',
      'php': 'PHP',
      'python': 'Python',
      'ruby': 'Ruby',
      'scala': 'Scala',
      'dynamic-html': 'Dynamic HTML',
      'html': 'HTML',
      'swagger': 'Swagger JSON',
      'swagger-yaml': 'Swagger YAML',
      'tizen': 'Tizen'
    };

    if (names[name]) {
      return names[name];
    }

    return name.split(/\s+|\-/).map(function(word) {
      return word[0].toUpperCase() + word.substr(1);
    }).join(' ');
  };
});
