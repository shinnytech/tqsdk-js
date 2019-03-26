var assert = require('assert');
var TQSDK = require('../lib/tqsdk')

describe('DataManager', function() {
    let tq = new TQSDK();
    let symbol = 'SHFE.rb1905';
    let dur = 5;

    before(function() {
        // runs before all tests in this block
    });

    after(function() {
        // runs after all tests in this block
    });

    beforeEach(function() {
        // runs before each test in this block
    });

    afterEach(function() {
        // runs after each test in this block
    });

    describe('# new datamanager', function() {
        it('初始化', function() {
            assert.equal(tq.dm.account_id, '');
        });
        it('bbb', function() {
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });

    describe('# update data', function() {
        it('mergeData', function() {
            let dm = new DataManager();
            assert.equal(dm.account_id, '');
        });
        it('bbb', function() {
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });

    describe('# get data', function() {
        it('aaa', function() {
            let dm = new DataManager();
            assert.equal(dm.account_id, '');
        });
        it('bbb', function() {
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });
});
