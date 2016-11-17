'use strict';

var _ = require('lodash');
var angular = require('angular');

SwaggerEditor.service('KeywordMap', function KeywordMap(defaults) {
  /*
   * JSON Schema completion map constructor
   *
   * This is necessary because JSON Schema completion map has recursive
   * pointers
  */
  // jscs:disable
  /* eslint quote-props: ["error", "as-needed", { "keywords": false, "unnecessary": false }]*/
  var JSONSchema = function() {
    _.extend(this,
      {
        title: String,
        type: String,
        format: String,
        default: this,
        description: String,
        enum: [String],
        minimum: String,
        maximum: String,
        exclusiveMinimum: String,
        exclusiveMaximum: String,
        multipleOf: String,
        maxLength: String,
        minLength: String,
        pattern: String,
        not: String,

        // jscs:disable
        '$ref': String,
        // jscs:enable

        definitions: {
          '.': this
        },

        // array specific keys
        items: [this],
        minItems: String,
        maxItems: String,
        uniqueItems: String,
        additionalItems: [this],

        // object
        maxProperties: String,
        minProperties: String,
        required: String,
        additionalProperties: String,
        allOf: [this],
        properties: {

          // property name
          '.': this
        }
      }
    );
  };

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

  var map = {
    name: String,
    director_uuid: String,
    releases: [release],
    stemcells: [stemcell],
    update: updateBlock,
    instance_groups: [instance_group]
  };

  // jscs:enable

  this.get = function() {
    var extension = angular.isObject(defaults.autocompleteExtension) ?
      defaults.autocompleteExtension : {};
    return _.extend(map, extension);
  };
});
