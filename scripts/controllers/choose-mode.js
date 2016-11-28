'use strict';

SwaggerEditor.controller('ChooseModeCtrl', function ChooseModeCtrl($scope,
  $uibModalInstance, $rootScope, $state, Analytics, Preferences, defaults) {
  $scope.modes = defaults.autoCompleteModes;
  $scope.selectedMode = Preferences.get('autoCompleteMode');

  $scope.save = function(mode) {
    Preferences.set('autoCompleteMode', mode);

    $uibModalInstance.close();
  };

  $scope.cancel = $uibModalInstance.close;
});
