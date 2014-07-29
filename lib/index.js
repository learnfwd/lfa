require('./stream');
require('./event-emitter');

module.exports = {
  Project: require('./project'),
  Target: require('./target'),
  File: require('./file'),
  DefaultTarget: require('./extensions/default-target').DefaultTarget,
  SequenceTask: require('./tasks/sequence-task'),
};
