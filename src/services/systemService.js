const os = require('os');
const { formatBytes, formatUptime } = require('../utils/helpers');

/**
 * Operating System information
 */
function getOSInfo() {
  return {
    name: os.type(),
    version: os.version(),
    release: os.release(),
    uptime: formatUptime(os.uptime()),
    uptimeRaw: os.uptime(),
  };
}

/**
 * CPU information
 */
function getCPUInfo() {
  const cpus = os.cpus();
  return {
    architecture: os.arch(),
    cores: cpus.length,
    model: cpus.length > 0 ? cpus[0].model : 'Unknown',
    speed: cpus.length > 0 ? `${cpus[0].speed} MHz` : 'Unknown',
    loadAverage: os.loadavg(),
  };
}

/**
 * Device / host information
 */
function getDeviceInfo() {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    homeDirectory: os.homedir(),
    tempDirectory: os.tmpdir(),
  };
}

/**
 * Node.js runtime information
 */
function getNodeInfo() {
  return {
    nodeVersion: process.version,
    v8Version: process.versions.v8,
    processId: process.pid,
  };
}

/**
 * Memory information with human-readable values
 */
function getMemoryInfo() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const usagePercent = ((used / total) * 100).toFixed(1);

  return {
    total: formatBytes(total),
    totalRaw: total,
    free: formatBytes(free),
    freeRaw: free,
    used: formatBytes(used),
    usedRaw: used,
    usagePercent: parseFloat(usagePercent),
  };
}

/**
 * Aggregated system information
 */
function getAllSystemInfo() {
  return {
    os: getOSInfo(),
    cpu: getCPUInfo(),
    device: getDeviceInfo(),
    node: getNodeInfo(),
    memory: getMemoryInfo(),
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  getOSInfo,
  getCPUInfo,
  getDeviceInfo,
  getNodeInfo,
  getMemoryInfo,
  getAllSystemInfo,
};
