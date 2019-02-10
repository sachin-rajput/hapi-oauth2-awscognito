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

it('returns a Bad Authorization token error', async () => {

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

    const request = { method: 'POST', url: '/', headers: { authorization: internals.inValidHeader(testClient.clientId, testClient.clientSecret) } };
    const res = await server.inject(request);

    expect(res.result.message).to.equal('Bad Authorization token');
});


const testClient = {
    clientId: '4uh9ofrtk75k6mk69rlkf0igk3',
    clientSecret: 'oun5pf2ld0rflkr4bbllrakvbcph4ehlejdcc13mombv9md0d62'
};

internals.clientList = ['4uh9ofrtk75k6mk69rlkf0igk3','67eupcvug7l2eb9s2p5c0520lo'];

internals.inValidHeader = function (clientId, clientSecret) {

    return 'Bearer IiOiI0dWg5b2ZydGs3NWs2bWs2OXJsa2YwaWdrMyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibWFuYWdlY3JlZGl0Y2FyZFwvYWxsIiwiYXV0aF90aW1lIjoxNTQ5NzQyMTY5LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9QWXhKZUZROGgiLCJleHAiOjE1NDk3NDU3NjksImlhdCI6MTU0OTc0MjE2OSwidmVyc2lvbiI6MiwianRpIjoiNzljNDg2NGQtNDI0NS00OWRiLThjOWEtYjI1ZmI3YzdjYzcwIiwiY2xpZW50X2lkIjoiNHVoOW9mcnRrNzVrNm1rNjlybGtmMGlnazMifQ.Xu_Y46jVujjumt2iHj4mbOfumTb-upUVBV5rFGz0BWE9JW8NPPNBtT1Kkwf_LW3JRFGa7p0PXdeKapxVGAokh92sTtauJTpTKZpbTVn9UtxG9Ak3emim9mwDtIeRbL5YpXSM7dUib8L4997URGSnEcF0MzwWUD4z6r44x2EvGQMBgbxAuXPty0iyD4o1H6uF9DdfsiuaEZA7tmAr2qscZLbolQrzvKAONHUAeKa_TpqxaH2pc7IjtIsykhrycPS1oYHZY6z9kUT-JATZuhIFQ-79heYON5Ik185spPfrp3anxsCXdtHy04QwJd2MI9HZj5ZVj-9z1aEE5Af_L6a4eQ';
    //add AWS Cognito oauth/token call here ... return 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64');
};

internals.header = function () {

    return 'Bearer eyJraWQiOiJLSGtjZHZBRVIyRzVsUTlya2lMTkJlNGFMVzhZSlpZU2ZTYmZBODdSZ2t3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0dWg5b2ZydGs3NWs2bWs2OXJsa2YwaWdrMyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibWFuYWdlY3JlZGl0Y2FyZFwvYWxsIiwiYXV0aF90aW1lIjoxNTQ5NzU2MzQyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9QWXhKZUZROGgiLCJleHAiOjE1NDk3NTk5NDIsImlhdCI6MTU0OTc1NjM0MiwidmVyc2lvbiI6MiwianRpIjoiZDlkOTMzNTUtYzVjMS00ODMyLTg2ZmYtMmY0NjJhYzA5MTc1IiwiY2xpZW50X2lkIjoiNHVoOW9mcnRrNzVrNm1rNjlybGtmMGlnazMifQ.kF3rHUniEDBYgoD22xFKsiKO-GIr7stF2M6o81EPIahDtpBCk9SZuAuj-Kf7U0WY0KJ7QoJE-q_Bk6B0p0azKdkcX4TjajPgaPjrLJlJWnzrQ2MKUvyzzyL0tR0KaCeOGF864JI2k_402MlbQpo5MfWS7wQFeRMGSdEYxQ64spumghF0aKIbOaZe_8yrfSLQmoYyPnZQioiWWo6yEaUu2V0y2XRy6ycafcppZNNCwee4eN2C31u1YeeMFUnnJjELnuRtkD6pFL7y2lbABrdn6Qo0mbIjSvaYYOZnLDIqGRwp0Dt7q34-NVI--80Pz_8JUMfDKM4C7f6QUbv6T6CAMA';
};

internals.clients = async function (request, basicToken, h) {

    let decodedClaims;
    try {
        decodedClaims = JwtDecode(basicToken);
    }
    catch (err) {
        throw Boom.badRequest('Bad Authorization token', 'Bearer');
    }

    if (decodedClaims) {
        const found = internals.clientList.includes(decodedClaims.client_id);

        if (found) {
            if ((decodedClaims.exp * 1000) >= new Date().getTime()) {
                console.log(decodedClaims);
                return await Promise.resolve({
                    isValid: true,
                    credentials: {
                        client_id: decodedClaims.client_id, exp: decodedClaims.exp, scope: decodedClaims.scope
                    }
                });
            }
            throw Boom.unauthorized('Token Expired', 'Bearer');
        }
        throw Boom.unauthorized('Invalid Client', 'Bearer');
    }

    throw Boom.badRequest('Bad Authorization token', 'Bearer');
};
