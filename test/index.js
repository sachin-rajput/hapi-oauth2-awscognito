'use strict';

// Load modules

const Boom = require('boom');
const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const JwtDecode = require('jwt-decode');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const it = lab.it;
const expect = Code.expect;


it('returns a reply on successful auth', async () => {

    const server = Hapi.server();
    await server.register(require('../'));

    server.auth.strategy('default', 'oauth2Token', {
        validate: internals.clients
    });

    server.route({
        method: 'POST',
        path: '/',
        handler: function (request, h) {

            return 'ok';
        },
        options: {
            auth: 'default'
        }
    });

    const request = { method: 'POST', url: '/', headers: { authorization: internals.header(testClient.clientId, testClient.clientSecret) } };
    const res = await server.inject(request);

    expect(res.result).to.equal('ok');
});


const testClient = {
    clientId: '4uh9ofrtk75k6mk69rlkf0igk3',
    clientSecret: 'oun5pf2ld0rflkr4bbllrakvbcph4ehlejdcc13mombv9md0d62'
};

internals.clientList = ['4uh9ofrtk75k6mk69rlkf0igk3','67eupcvug7l2eb9s2p5c0520lo'];

internals.header = function (clientId, clientSecret) {

    return 'Basic eyJraWQiOiJLSGtjZHZBRVIyRzVsUTlya2lMTkJlNGFMVzhZSlpZU2ZTYmZBODdSZ2t3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0dWg5b2ZydGs3NWs2bWs2OXJsa2YwaWdrMyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibWFuYWdlY3JlZGl0Y2FyZFwvYWxsIiwiYXV0aF90aW1lIjoxNTQ5NzQyMTY5LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9QWXhKZUZROGgiLCJleHAiOjE1NDk3NDU3NjksImlhdCI6MTU0OTc0MjE2OSwidmVyc2lvbiI6MiwianRpIjoiNzljNDg2NGQtNDI0NS00OWRiLThjOWEtYjI1ZmI3YzdjYzcwIiwiY2xpZW50X2lkIjoiNHVoOW9mcnRrNzVrNm1rNjlybGtmMGlnazMifQ.Xu_Y46jVujjumt2iHj4mbOfumTb-upUVBV5rFGz0BWE9JW8NPPNBtT1Kkwf_LW3JRFGa7p0PXdeKapxVGAokh92sTtauJTpTKZpbTVn9UtxG9Ak3emim9mwDtIeRbL5YpXSM7dUib8L4997URGSnEcF0MzwWUD4z6r44x2EvGQMBgbxAuXPty0iyD4o1H6uF9DdfsiuaEZA7tmAr2qscZLbolQrzvKAONHUAeKa_TpqxaH2pc7IjtIsykhrycPS1oYHZY6z9kUT-JATZuhIFQ-79heYON5Ik185spPfrp3anxsCXdtHy04QwJd2MI9HZj5ZVj-9z1aEE5Af_L6a4eQ';
    //add AWS Cognito oauth/token call here ... return 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64');
};

internals.clients = async function (request, basicToken, h) {

    const decodedClaims = JwtDecode(basicToken);

    if (decodedClaims) {
        const found = internals.clientList.includes(decodedClaims.client_id);

        if (found) {
            if (decodedClaims.exp <= new Date().getTime()) {

                return await Promise.resolve({
                    isValid: true,
                    credentials: {
                        client_id: decodedClaims.client_id, exp: decodedClaims.exp, scope: decodedClaims.scope
                    }
                });
            }
            throw Boom.unauthorized('Token Expired', 'Basic');
        }
        throw Boom.unauthorized('Invalid Client', 'Basic');
    }

    throw Boom.badRequest('Bad Authorization token', 'Basic');
};
