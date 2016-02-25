import JSONB, { bufferToJSON } from '../../src/JSONB';

describe('bufferToJSON', () => {
  it('should JSONify buffer', () => {
    const dataArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const buffer = new Buffer(dataArray);
    const base64String = buffer.toString('base64');
    const JSONObject = bufferToJSON.call(buffer);

    return Promise.all([
      expect(JSONObject).to.be.an('object'),
      expect(JSONObject).to.have.ownProperty('type'),
      expect(JSONObject).to.have.ownProperty('data'),
      expect(JSONObject.type).to.be.a('string'),
      expect(JSONObject.data).to.be.a('string'),
      expect(JSONObject.type).to.be.equal('Buffer'),
      expect(JSONObject.data).to.be.equal(base64String)
    ]);
  });
});

describe('JSONB', () => {
  it('should have a static method .polyfill()', () => {
    return Promise.all([
      expect(JSONB).to.have.ownProperty('polyfill'),
      expect(JSONB.polyfill).to.be.a('function')
    ]);
  });

  it('should have a static method .override()', () => {
    return Promise.all([
      expect(JSONB).to.have.ownProperty('override'),
      expect(JSONB.override).to.be.a('function')
    ]);
  });

  it('should have a static method .parse()', () => {
    return Promise.all([
      expect(JSONB).to.have.ownProperty('parse'),
      expect(JSONB.parse).to.be.a('function')
    ]);
  });

  it('should have a static method .stringify()', () => {
    return Promise.all([
      expect(JSONB).to.have.ownProperty('stringify'),
      expect(JSONB.stringify).to.be.a('function')
    ]);
  });

  describe('.polyfill(override = false)', () => {
    before(function () {
      Buffer._toJSON = Buffer.prototype.toJSON;
    });

    after(function () {
      Buffer.prototype.toJSON = Buffer._toJSON;
    });

    it('should polyfill Buffer.prototype.toJSON', () => {
      Buffer.prototype.toJSON = undefined;
      JSONB.polyfill(false);
      return Promise.all([
        expect(Buffer.prototype).to.have.ownProperty('toJSON'),
        expect(Buffer.prototype.toJSON).to.be.a('function'),
        expect(Buffer.prototype.toJSON).to.be.equal(bufferToJSON)
      ]);
    });

    it('should not override Buffer.prototype.toJSON', () => {
      Buffer.prototype.toJSON = function () {};
      JSONB.polyfill(false);
      return Promise.all([
        expect(Buffer.prototype).to.have.ownProperty('toJSON'),
        expect(Buffer.prototype.toJSON).to.be.a('function'),
        expect(Buffer.prototype.toJSON).to.be.not.equal(bufferToJSON)
      ]);
    });
  });

  describe('.polyfill(override = true)', () => {
    before(function () {
      Buffer._toJSON = Buffer.prototype.toJSON;
      JSONB.polyfill(true);
    });

    after(function () {
      Buffer.prototype.toJSON = Buffer._toJSON;
    });

    it('should override Buffer.prototype.toJSON', () => {
      return Promise.all([
        expect(Buffer.prototype).to.have.ownProperty('toJSON'),
        expect(Buffer.prototype.toJSON).to.be.a('function'),
        expect(Buffer.prototype.toJSON).to.be.equal(bufferToJSON)
      ]);
    });
  });

  describe('.override()', () => {
    before(function () {
      Buffer._toJSON = Buffer.prototype.toJSON;
      JSONB.override();
    });

    after(function () {
      Buffer.prototype.toJSON = Buffer._toJSON;
    });

    it('should override Buffer.prototype.toJSON', () => {
      return Promise.all([
        expect(Buffer.prototype).to.have.ownProperty('toJSON'),
        expect(Buffer.prototype.toJSON).to.be.a('function'),
        expect(Buffer.prototype.toJSON).to.be.equal(bufferToJSON)
      ]);
    });
  });

  describe('.parse()', () => {
    it('should match JSON.parse()', () => {
      const json = `[{
        "numeric":1234,
        "string":"foo",
        "booleanTrue":true,
        "booleanFalse":false,
        "null":null,
        "object":{
          "key":"value"
        }
      }]`;

      const JSONBParsed = JSONB.parse(json);
      const JSONParsed = JSON.parse(json);
      return expect(JSONBParsed).to.be.deep.equal(JSONParsed);
    });

    it('should parse base64 encoded buffer', () => {
      const json = `{
        "type":"Buffer",
        "data":"AQIDBA=="
      }`;

      const buffer = JSONB.parse(json);
      return Promise.all([
        expect(buffer).to.be.instanceof(Buffer),
        expect(buffer.equals(new Buffer([ 1, 2, 3, 4 ]))).to.be.true
      ]);
    });

    it('should parse array encoded buffer', () => {
      const json = `{
        "type":"Buffer",
        "data":[1,2,3,4]
      }`;

      const buffer = JSONB.parse(json);
      return Promise.all([
        expect(buffer).to.be.instanceof(Buffer),
        expect(buffer.equals(new Buffer([ 1, 2, 3, 4 ]))).to.be.true
      ]);
    });

    it('should proxy reviver', () => {
      return new Promise((resolve) => {
        JSONB.parse('{}', resolve);
      });
    });
  });

  describe('.stringify', () => {
    before(function () {
      Buffer._toJSON = Buffer.prototype.toJSON;
      JSONB.override();
    });

    after(function () {
      Buffer.prototype.toJSON = Buffer._toJSON;
    });

    it('should match JSON.stringify()', () => {
      const object = [{
        numeric: 1234,
        string: 'foo',
        booleanTrue: true,
        booleanFalse: false,
        null: null,
        object: {
          key: 'value'
        }
      }];

      const JSONBStringified = JSONB.stringify(object);
      const JSONStringified = JSON.stringify(object);
      return expect(JSONBStringified).to.be.equal(JSONStringified);
    });

    it('should stringify buffer', () => {
      const buffer = new Buffer([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const JSONBStringified = JSONB.stringify(buffer);
      const expectResult = JSON.stringify(bufferToJSON.call(buffer));
      return expect(JSONBStringified).to.be.equal(expectResult);
    });
  });
});
