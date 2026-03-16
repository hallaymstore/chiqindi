const runtime = {
  mode: 'mongo',
  connected: false,
  usingJsonFallback: false,
  lastError: null
};

const setRuntime = (partialState = {}) => {
  Object.assign(runtime, partialState);
  return { ...runtime };
};

const getRuntime = () => ({ ...runtime });

const isJsonMode = () => runtime.mode === 'json';

module.exports = {
  setRuntime,
  getRuntime,
  isJsonMode
};
