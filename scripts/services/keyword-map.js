'use strict';

var _ = require('lodash');
var angular = require('angular');
SwaggerEditor.service('KeywordMap', function KeywordMap(Preferences, defaults) {
  /* eslint-disable */
  /**
   * ========================================================================================
   * ========================================================================================
   * Deployment Manifest Schema
   */
  var release = {
    name: String,
    version: String
  };

  var stemcell = {
    alias: String,
    os: String,
    name: String,
    version: String
  };

  var updateBlock = {
    canaries: String,
    max_in_flight: String,
    canary_watch_time: String,
    update_watch_time: String,
    serial: Boolean
  };

  var job = {
    name: String,
    release: String,
    consumes: Object,
    provides: Object,
    properties: Object
  };

  var network = {
    name: String,
    static_ips: [String],
    "default": [String]
  };

  var instance_group = {
    name: String,
    instances: Number,
    lifecycle: String,
    azs: [String],
    vm_type: String,
    vm_extensions: [String],
    stemcell: String,
    migrated_from: String,
    networks: [network],
    jobs: [job]
  };

  var deploymentManifestMap = {
    name: String,
    director_uuid: String,
    releases: [release],
    stemcells: [stemcell],
    update: updateBlock,
    instance_groups: [instance_group]
  };

  /**
   * ========================================================================================
   * ========================================================================================
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
    var choosenMode = Preferences.get("autoCompleteMode");
    var choosenMap = [];

    switch (choosenMode) {
      case "deployment-manifest":
        choosenMap = deploymentManifestMap;
        break;
      case "runtime-config":
        choosenMap = runtimeConfigMap;
        break;
      default:
        console.log("Sorry, mode '" + choosenMode + "' is not supported.");
    }

    var extension = angular.isObject(defaults.autocompleteExtension) ?
      defaults.autocompleteExtension : {};
    return _.extend(choosenMap, extension);
  };
});
