/**
 * Environment Variables Service
 * Returns only selected, safe environment variables.
 */

const SELECTED_VARS = ['PATH', 'HOME', 'USERNAME', 'NODE_ENV', 'COMPUTERNAME', 'OS', 'PROCESSOR_ARCHITECTURE'];

/**
 * Get selected environment variables with graceful fallback
 */
function getSelectedEnvVars() {
  return SELECTED_VARS.map((key) => ({
    name: key,
    value: process.env[key] || 'Not set',
    isSet: !!process.env[key],
  }));
}

/**
 * Search environment variables by name
 */
function searchEnvVars(query) {
  const all = getSelectedEnvVars();
  if (!query) return all;
  const q = query.toLowerCase();
  return all.filter((v) => v.name.toLowerCase().includes(q));
}

module.exports = {
  getSelectedEnvVars,
  searchEnvVars,
};
