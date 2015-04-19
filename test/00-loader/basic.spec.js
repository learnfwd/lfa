/*global describe, it*/
'use strict';
var assert = require('assert');
var LFA = require('../../');

describe('lfa node module', function () {
    it('must be a function', function () {
        assert(typeof(LFA) === 'function', 'LFA does not export a function');
    });

    it('must not be created directly', function () {
      (function () {
        new LFA();
      }).should.throw();
    });
});
