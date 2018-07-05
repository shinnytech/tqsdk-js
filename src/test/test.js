describe('New TQSDK', () => {
    var TQ = new TQSDK(new MockWebsocket());
    var symbol = 'SHFE.rb1810';
    var dur = 5;

    before( () => {
        console.log('see.. this function is run ONCE only')
    });
    beforeEach(function(){
        console.log('see.. this function is run EACH time')
    });


});

