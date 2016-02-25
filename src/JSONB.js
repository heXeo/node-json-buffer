export function bufferToJSON () {
  return {
    type: 'Buffer',
    data: this.toString('base64')
  };
}

export default class JSONB {
  static override () {
    this.polyfill(true);
  }

  static polyfill (override) {
    if (override || typeof Buffer.prototype.toJSON === 'undefined') {
      Buffer.prototype.toJSON = bufferToJSON;
    }
  }

  static parse (text, reviver) {
    const bufferReviver = (key, value) => {
      if (value && typeof value === 'object') {
        if (value.type && value.type === 'Buffer') {
          if (typeof value.data === 'string') {
            value = new Buffer(value.data, 'base64');
          } else if (value.data instanceof Array) {
            value = new Buffer(value.data);
          }
        }
      }

      if (reviver) {
        return reviver(key, value);
      }
      return value;
    };
    return JSON.parse(text, bufferReviver);
  }

  static stringify (value, ...options) {
    return JSON.stringify(value, ...options);
  }
}
