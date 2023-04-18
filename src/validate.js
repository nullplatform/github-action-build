const RESOURCE_LIST = Object.freeze([
  'application',
  'build',
  'release',
  'deploy',
]);

class Validate {
  static isEmpty(string) {
    return !string;
  }

  static isValidResource(resource) {
    return RESOURCE_LIST.includes(resource);
  }
}

module.exports = Validate;
