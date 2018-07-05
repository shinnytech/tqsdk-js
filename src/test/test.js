describe('Array', () => {
    describe('#indexOf()', () => {
        it('should return -1 when the value is not present', () => {
            assert.equal(-1, [1,2,3].indexOf(4));
            var TQ = new TQSDK(new MockWebsocket());
            init_test_data(TQ);
            assert.equal('object', typeof TQ);
        });
    });
});

