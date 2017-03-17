'use strict';

var _ = require('lodash');
var SparkMD5 = require('spark-md5');
var angular = require('angular');

SwaggerEditor.controller('PreviewCtrl', function PreviewCtrl(Storage, Builder,
  ASTManager, Editor, FocusedPath, Preferences, FoldStateManager,
  $scope, $rootScope, $stateParams, $sessionStorage) {
  $scope.loadLatest = loadLatest;
  $scope.stateParams = $stateParams;
  $scope.isVendorExtension = isVendorExtension;
  $scope.showDefinitions = showDefinitions;
  $scope.responseCodeClassFor = responseCodeClassFor;
  $scope.focusEdit = focusEdit;
  $scope.showPath = showPath;
  $scope.foldEditor = FoldStateManager.foldEditor;
  $scope.listAllOperation = listAllOperation;
  $scope.listAllDefnitions = listAllDefnitions;
  $scope.listAllInstanceGroups = listAllInstanceGroups;
  $scope.listAllVariables = listAllVariables;
  $scope.isCurrentMode = isCurrentMode;

  Storage.addChangeListener('yaml', update);
  Preferences.onChange(function() {
    update($rootScope.editorValue);
  });

  /**
   * Reacts to updates of YAML in storage that usually triggered by editor
   * changes.
   * @param {object} latest - the swagger spec.
   * @param {boolean} force - updates the force.
   * @return {undefined}
  */
  function update(latest, force) {
    if (!Preferences.get('liveRender') && !force && $scope.specs) {
      $rootScope.isDirty = true;
      $rootScope.progressStatus = 'progress-unsaved';
      return;
    }

    // Error can come in success callback, because of recursive promises
    // So we install same handler for error and success
    Builder.buildDocs(latest).then(onBuildSuccess, onBuildFailure);
  }

  /**
   * General callback for builder results
   * @param {Object} result - the result object
  */
  function onBuild(result) {
    $scope.$broadcast('toggleWatchers', true);  // turn watchers back on

    if (result.specs && result.specs.securityDefinitions) {
      var securityKeys = {};
      _.forEach(result.specs.securityDefinitions, function(security, key) {
        securityKeys[key] =
          SparkMD5.hash(JSON.stringify(security));
      });
      $sessionStorage.securityKeys = securityKeys;
    }

    $rootScope.$apply(function() {
      if (result.specs) {
        var variablesUsages = extractVariables(result.specs);
        injectVariablesUsageInSpec(result.specs.variables, variablesUsages);
        createPrettyOptions(result.specs.variables);

        $rootScope.specs = result.specs;
      }
      $rootScope.errors = result.errors || [];
      $rootScope.warnings = result.warnings || [];
    });
  }

  /**
   * Callback of builder success
   * @param {Object} result - the result object
  */
  function onBuildSuccess(result) {
    onBuild(result);

    $rootScope.$apply(function() {
      $rootScope.progressStatus = 'success-process';
    });

    Editor.clearAnnotation();

    _.each(result.warnings, function(warning) {
      Editor.annotateSwaggerError(warning, 'warning');
    });
  }

  /**
   * Callback of builder failure
   * @param {Object} result - the result object
  */
  function onBuildFailure(result) {
    onBuild(result);

    $rootScope.$apply(function() {
      if (angular.isArray(result.errors)) {
        if (result.errors[0].yamlError) {
          Editor.annotateYAMLErrors(result.errors[0].yamlError);
          $rootScope.progressStatus = 'error-yaml';
        } else if (result.errors.length) {
          $rootScope.progressStatus = 'error-swagger';
          result.errors.forEach(function(error) {
            Editor.annotateSwaggerError(error, 'error');
          });
        } else {
          $rootScope.progressStatus = 'progress';
        }
      } else {
        $rootScope.progressStatus = 'error-general';
      }
    });
  }

  /**
   * Loads the latest spec from editor value
  */
  function loadLatest() {
    update($rootScope.editorValue, true);
    $rootScope.isDirty = false;
  }

  /**
   * @param {String} mode input mode to check for
   * @return {boolean} if mode passed ins current mode
   */
  function isCurrentMode(mode) {
    var currentMode = Preferences.get('autoCompleteMode');
    return currentMode.toUpperCase() === mode.toUpperCase();
  }

  /**
   * Focuses editor to a line that represents that path beginning
   * @param {AngularEvent} $event - angular event
   * @param {array} path - an array of keys into specs structure
  */
  function focusEdit($event, path) {
    $event.stopPropagation();

    ASTManager.positionRangeForPath($rootScope.editorValue, path)
    .then(function(range) {
      Editor.gotoLine(range.start.line);
      Editor.focus();
    });
  }

  /**
   * Response CSS class for an HTTP response code
   *
   * @param {number} code - The HTTP Response CODE
   *
   * @return {string} - CSS class to be applied to the response code HTML tag
  */
  function responseCodeClassFor(code) {
    var colors = {
      2: 'green',
      3: 'blue',
      4: 'yellow',
      5: 'red'
    };
    return colors[Math.floor(Number(code) / 100)] || 'default';
  }

  /**
   * Determines if a key is a vendor extension key
   * Vendor extensions always start with `x-`
   *
   * @param {string} key - key
   *
   * @return {boolean} ture if key is a vendor extension
  */
  function isVendorExtension(key) {
    return _.startsWith(key, 'x-');
  }

  /**
   * Determines if we should render the definitions sections
   *
   * @param {object|null} definitions - the definitions object of Swagger spec
   *
   * @return {boolean} - true if definitions object should be rendered, false
   *  otherwise
  */
  function showDefinitions(definitions) {
    return angular.isObject(definitions);
  }

  /**
   * Determines if apath should be shown or not
   * @param  {object} path     the path object
   * @param  {string} pathName the path name in paths hash
   * @return {boolean}         true if the path should be shown
   */
  function showPath(path, pathName) {
    return true;
  }

  /**
   * Folds all operation regardless of their current fold status
   *
  */
  function listAllOperation() {
    // unfold folded paths first
    _.each($scope.specs.paths, function(path, pathName) {
      if (_.isObject(path) && path.$folded === true) {
        path.$folded = false;
        FoldStateManager.foldEditor(['paths', pathName], false);
      }
    });

    _.each($scope.specs.paths, function(path, pathName) {
      _.each(path, function(operation, operationName) {
        if (_.isObject(operation)) {
          operation.$folded = true;
          FoldStateManager.foldEditor([
            'paths',
            pathName,
            operationName
          ], true);
        }
      });
    });
  }

  /**
   * Folds all definitions regardless of their current fold status
   *
  */
  function listAllDefnitions() {
    _.each($scope.specs.definitions, function(definition, definitionName) {
      if (_.isObject(definition)) {
        definition.$folded = true;
        FoldStateManager.foldEditor(['definitions', definitionName], true);
      }
    });
  }

  /**
   * Folds all instance groups regardless of their current fold status
   *
  */
  function listAllInstanceGroups() {
    _.each($scope.specs.instance_groups, function(instanceGroup, index) {
      if (_.isObject(instanceGroup)) {
        instanceGroup.$folded = !instanceGroup.$folded;
        // FoldStateManager.foldEditor(['instance_groups', index], true);
      }
    });
  }

  /**
   * Folds all variables regardless of their current fold status
   *
  */
  function listAllVariables() {
    _.each($scope.specs.variables, function(variable, index) {
      if (_.isObject(variable)) {
        variable.$folded = !variable.$folded;
      }
    });
  }

  /**
   * Flatten the manifest tree
   * @param {object} ob manifest tree
   * @return {object} Flattened tree
  */
  function flattenObject(ob) {
    var toReturn = {};

    for (var i in ob) {
      if (!ob.hasOwnProperty(i)) continue;

      if ((typeof ob[i]) === 'object') {
        var flatObject = flattenObject(ob[i]);

        for (var x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;

          if (Object.prototype.toString.call(ob) === '[object Array]') {
            toReturn['name=' + ob[i].name + '/' + x] = flatObject[x];
          } else {
            toReturn[i + '/' + x] = flatObject[x];
          }
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
    return toReturn;
  }

  /**
   * Create Variables Mapping
   * @param {object} spec variables spec
   * @return {object} Map, keys are variable names,
   * values list of there usages
  */
  function extractVariables(spec) {
    var flatObject = flattenObject(spec);
    var result = {};
    var regexp = /\(\(.*?\)\)/gi;

    _.each(flatObject, function(item, path) {
      if (item) {
        var placeholderList = String(item).match(regexp);

        var varsFound = _.map(placeholderList, function(placeholder) {
          var strippedName = placeholder.replace(/^\(\(|\)\)$/g, '');
          return strippedName.split(".", 1)[0];
        });

        _.each(varsFound, function(variableName) {
          if (variableName in result) {
            result[variableName].push(path);
          } else {
            result[variableName] = [path];
          }
        });
      }
    });

    return result;
  }

  /**
   * Inject Variable mappings to spec
   * @param {object} variablesSpec variables spec
   * @param {object} variablesUsage variables usages map
  */
  function injectVariablesUsageInSpec(variablesSpec, variablesUsage) {
    if (variablesSpec) {
      _.forEach(variablesSpec, function(variableSpecItem) {
        variableSpecItem.usages = variablesUsage[variableSpecItem.name];
      });
    }
  }

  /**
   * Create Pretty Options
   * @param {object} variablesSpec variables spec
  */
  function createPrettyOptions(variablesSpec) {
    if (variablesSpec) {
      _.forEach(variablesSpec, function(varSpec) {
        if (varSpec.options) {
          varSpec.prettyOptions = JSON.stringify(varSpec.options, undefined, 4);
        }
      });
    }
  }
});
