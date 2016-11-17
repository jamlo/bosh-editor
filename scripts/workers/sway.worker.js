// Worker code from here
/* eslint-env worker */
onmessage = function(message) {
  postMessage({
    errors: [],
    specs: message.data.definition,
    warnings: []
  });
};
