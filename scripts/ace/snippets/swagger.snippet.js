'use strict';

var _ = require('lodash');

SwaggerEditor.config(function($provide) {

  /**
   * ================================================================================
   * ================================================================================
   * Deployment Manifest Snippets
   */
  function makeReleasesSnippet() {
    return [
      'releases:',
      '- name: ${1}',
      '  version: ${2}'
    ];
  }

  function makeReleasesDescriptionsSnippet() {
    return [
      '#Schema: http://bosh.io/docs/manifest-v2.html#releases',
      'releases:',
      '- name: #[String, required]: Name of a release used in the deployment.',
      '  version: #[String, required]: The version of the release to use. Version can be latest'
    ];
  }

  function makeStemcellsSnippet() {
    return [
      'stemcells:',
      '- alias: ${1}',
      '  os: ${2}',
      '  name: ${3}',
      '  version: ${4}'
    ];
  }

  function makeStemcellsDescriptionsSnippet() {
    return [
      '#Schema: http://bosh.io/docs/manifest-v2.html#stemcells',
      'stemcells:',
      '- alias: #[String, required]: Name of a stemcell used in the deployment',
      '  os: #[String, optional]: Operating system of a matching stemcell. Example: ubuntu-trusty',
      '  name: #[String, optional]: Full name of a matching stemcell. Either name or os keys can be specified.',
      '  version: #[String, required]: The version of a matching stemcell. Version can be latest'
    ];
  }

  function makeUpdateSnippet() {
    return [
      'update:',
      '  canaries: ${1}',
      '  max_in_flight: ${2}',
      '  canary_watch_time: ${3}',
      '  update_watch_time: ${4}',
      '  serial: ${5}'
    ];
  }

  function makeUpdateDescriptionSnippet() {
    return [
      '#Schema: http://bosh.io/docs/manifest-v2.html#update',
      'update:',
      '  canaries: #[Integer, required]: The number of canary instances.',
      '  max_in_flight: #[Integer, required]: The maximum number of non-canary instances to update in parallel.',
      '  canary_watch_time: #[Integer or Range, required]: Only applies to monit start operation.',
      '  update_watch_time: #[Integer or Range, required]: Only applies to monit start operation.',
      '  serial: #[Boolean, optional]: If disabled (set to false), instance groups will be deployed in parallel, otherwise - sequentially. Defaults to true'
    ];
  }

  function makeInstanceGroupSnippet() {
    return [
      'instance_groups:',
      '- name: ${1}',
      '  instances: ${2}',
      '  lifecycle: ${3:service}',
      '  azs: [${4}]',
      '  vm_type: ${5}',
      '  vm_extensions: [${6}]',
      '  stemcell: ${7}',
      '  persistent_disk_type: ${8}',
      '  update: ${9}',
      '  migrated_from: [${10}]',
      '  networks:',
      '  - name: ${11}',
      '    static_ips: ${12}',
      '    default: ${13}',
      '  jobs:',
      '  - name: ${14}',
      '    release: ${15}',
      '    consumes: ${16}',
      '    provides: ${17}',
      '    properties: ${18:{}}'
    ];
  }

  function makeInstanceGroupDescriptionSnippet() {
    return [
      '#Schema: http://bosh.io/docs/manifest-v2.html#instance-groups',
      'instance_groups: #[Array, required]: Specifies the mapping between release jobs and instance groups.',
      '- name: #[String, required]: A unique name used to identify and reference instance group.',
      '  instances: #[Integer, required]: The number of instances in this group. Each instance is a VM. ',
      '  lifecycle: #[String, optional]: Specifies the kind of workload the instance group represents. Valid values are service and errand; defaults to service',
      '  azs: []#[Array, required]: List of AZs associated with this instance group',
      '  vm_type: #[String, required]: A valid VM type name from the cloud config.',
      '  vm_extensions: []#[Array, required]: A valid list of VM extension names from the cloud config',
      '  stemcell: #[String, required]: A valid stemcell alias from the Stemcells Block.',
      '  persistent_disk_type: #[String, optional]: A valid disk type name from the cloud config',
      '  update: #[Hash, optional]: Specific update settings for this instance group. ',
      '  migrated_from: []#[Array, optional]: Specific migration settings for this instance group',
      '  networks: #[Array, required]: Specifies the networks this instance requires. ',
      '  - name: #[String, required]: A valid network name from the cloud config.',
      '    static_ips: #[Array, optional]: Array of IP addresses reserved for the instances on the network.',
      '    default: #[Array, optional]: Specifies which network components (DNS, Gateway) BOSH populates by default from this network. Required when multiple networks are defined.',
      '  jobs: #Specifies the name and release of jobs that will be installed on each instance.s',
      '  - name: #[String, required]: The job name',
      '    release: #[String, required]: The release where the job exists',
      '    consumes: #[Hash, optional]: Links consumes by the job. ',
      '    provides: #[Hash, optional]: Links provided by the job',
      '    properties: #[Hash, required]: Specifies job properties'
    ];
  }

  function generateDeploymentManifestSnippets() {
    var deploymentManifestSnippets = [
      {
        name: 'releases',
        trigger: 'rel',
        path: [],
        content: makeReleasesSnippet().join('\n')
      },

      {
        name: 'releases (+)',
        trigger: 'rel',
        path: [],
        content: makeReleasesDescriptionsSnippet().join('\n')
      },

      {
        name: 'stemcells',
        trigger: 'ste',
        path: [],
        content: makeStemcellsSnippet().join('\n')
      },

      {
        name: 'stemcells (+)',
        trigger: 'ste',
        path: [],
        content: makeStemcellsDescriptionsSnippet().join('\n')
      },

      {
        name: 'update',
        trigger: 'upd',
        path: [],
        content: makeUpdateSnippet().join('\n')
      },

      {
        name: 'update (+)',
        trigger: 'upd',
        path: [],
        content: makeUpdateDescriptionSnippet().join('\n')
      },

      {
        name: 'instance_groups',
        trigger: 'ins',
        path: [],
        content: makeInstanceGroupSnippet().join('\n')
      },

      {
        name: 'instance_groups (+)',
        trigger: 'ins',
        path: [],
        content: makeInstanceGroupDescriptionSnippet().join('\n')
      }
    ];

    deploymentManifestSnippets.forEach(function(element) {
      element.mode = "deployment-manifest";
    });

    return deploymentManifestSnippets;
  }

  /**
   * ================================================================================
   * ================================================================================
   * Runtime Config Snippets
   */
  function rcMakeReleasesSnippet() {
    return [
      'releases:',
      '- name: ${1}',
      '  version: ${2}'
    ];
  }

  function rcMakeReleasesDescriptionSnipppet() {
    return [
      '#Schema: http://bosh.io/docs/runtime-config.html#releases',
      'releases: # [Array, required]: Specifies the releases used by the addons.',
      '- name: ${1} # [String, required]: Name of a release name used by an addon.',
      '  version: ${2} # [String, required]: The version of the release to use. Version cannot be latest; it must be specified explicitly.'
    ];
  }

  function rcMakeAddonsSnippet() {
    return [
      'addons:',
      '- name: ${1}',
      '  jobs:',
      '  - name: ${2}',
      '    release: ${3}',
      '    properties: ${4}',
      '  include: ${5}',
      '    deployments: []',
      '    jobs:',
      '    - name: ${6}',
      '      release: ${7}',
      '    stemcell:',
      '      os: ${8}',
      '  properties: ${9}'
    ];
  }

  function rcMakeAddonsDescriptionSnippet() {
    return [
      '#Schema: http://bosh.io/docs/runtime-config.html#addons',
      'addons: # [Array, optional]: Specifies the addons to be applied to all deployments.',
      '- name: ${1} # [String, required]: A unique name used to identify and reference the addon.',
      '  jobs: # [Hash, requires]: Specifies the name and release of release jobs to be colocated.',
      '  - name: ${2} # [String, required]: The job name.',
      '    release: ${3} #  [String, required]: The release where the job exists.',
      '    properties: ${4}',
      '  include: ${5} # [Hash, optional]: Specifies placement rules. (Rules for exclusions are coming soon.) Available in bosh-release v260+.',
      '    deployments: []',
      '    jobs:',
      '    - name: ${6}',
      '      release: ${7}',
      '    stemcell:',
      '      os: ${8}',
      '  properties: ${9} # [Hash, optional]: Specifies job properties. properties specified on an addon are only accessible to addons.'
    ];
  }

  function generateCloudConfigSnippets() {
    var cloudConfigSnippets = [
      {
        name: 'releases',
        trigger: 'rel',
        path: [],
        content: rcMakeReleasesSnippet().join('\n')
      },

      {
        name: 'releases (+)',
        trigger: 'rel',
        path: [],
        content: rcMakeReleasesDescriptionSnipppet().join('\n')
      },

      {
        name: 'addons',
        trigger: 'add',
        path: [],
        content: rcMakeAddonsSnippet().join('\n')
      },

      {
        name: 'addons (+)',
        trigger: 'add',
        path: [],
        content: rcMakeAddonsDescriptionSnippet().join('\n')
      }
    ];

    cloudConfigSnippets.forEach(function(element) {
      element.mode = "runtime-config";
    });

    return cloudConfigSnippets;
  }

  var allSnippets =_.concat(
    generateDeploymentManifestSnippets(),
    generateCloudConfigSnippets()
  );

  $provide.constant('snippets', allSnippets);
});
