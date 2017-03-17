'use strict';

var _ = require('lodash');
var angular = require('angular');
SwaggerEditor.service('KeywordMap', function KeywordMap(Preferences, defaults) {
  /* eslint-disable */
  /**
   * ===================================================================================================================
   * ===================================================================================================================
   * Deployment Manifest Schema
   */
  var dm_release = {
    name: String,
    version: String
  };

  var dm_stemcell = {
    alias: String,
    os: String,
    name: String,
    version: String
  };

  var dm_updateBlock = {
    canaries: String,
    max_in_flight: String,
    canary_watch_time: String,
    update_watch_time: String,
    serial: Boolean
  };

  var dm_job = {
    name: String,
    release: String,
    consumes: Object,
    provides: Object,
    properties: Object
  };

  var dm_network = {
    name: String,
    static_ips: [String],
    "default": [String]
  };

  var dm_instance_group = {
    name: String,
    instances: Number,
    lifecycle: String,
    azs: [String],
    vm_type: String,
    vm_extensions: [String],
    stemcell: String,
    migrated_from: String,
    networks: [dm_network],
    jobs: [dm_job]
  };

  var dm_variable = {
    name: String,
    type: String,
    options: Object,
  };

  var deploymentManifestMap = {
    name: String,
    director_uuid: String,
    releases: [dm_release],
    stemcells: [dm_stemcell],
    update: dm_updateBlock,
    instance_groups: [dm_instance_group],
    variables: [dm_variable]
  };

  /**
   * ===================================================================================================================
   * ===================================================================================================================
   * Runtime Config Schema
   */
  var rc_release = {
    name: String,
    version: String
  };

  var rc_job = {
    name: String,
    release: String
  };

  var rc_addon = {
    name: String,
    jobs: [rc_job],
    include: Object,
    properties: Object
  };

  var runtimeConfigMap = {
    releases: [rc_release],
    addons: [rc_addon],
    tags: Object
  };

  /* eslint-enable */
  this.get = function() {
    var chosenMode = Preferences.get("autoCompleteMode");
    var chosenMap = [];

    switch (chosenMode) {
      case "Deployment-Manifest":
        chosenMap = deploymentManifestMap;
        break;
      case "Runtime-Config":
        chosenMap = runtimeConfigMap;
        break;
      default:
        console.log("Sorry, mode '" + chosenMode + "' is not supported.");
    }

    var extension = angular.isObject(defaults.autocompleteExtension) ?
      defaults.autocompleteExtension : {};
    return _.extend(chosenMap, extension);
  };
});
