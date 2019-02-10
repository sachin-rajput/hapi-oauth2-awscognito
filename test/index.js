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


it('returns a reply on successful auth using header', async () => {

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

it('returns a reply on successful auth using query', async () => {

    const server = Hapi.server();
    await server.register(require('../'));

    server.auth.strategy('default', 'oauth2Token', {
        validate: internals.clients
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            return 'ok';
        },
        options: {
            auth: 'default'
        }
    });

    const request = { method: 'GET', url: '/?access_token=' + internals.token(testClient.clientId, testClient.clientSecret), headers: { } };
    const res = await server.inject(request);

    expect(res.result).to.equal('ok');
});

// it('returns a reply on successful auth using payload', async () => {

//     const server = Hapi.server();
//     await server.register(require('../'));

//     server.auth.strategy('default', 'oauth2Token', {
//         validate: internals.clients
//     });

//     server.route({
//         method: 'POST',
//         path: '/',
//         handler: function (request, h) {

//             return 'ok';
//         },
//         options: {
//             auth: 'default',
//             payload: {
//                 output: 'data',
//                 parse: true
//             }
//         }
//     });

//     const request = { method: 'POST', url: '/', payload: { access_token: internals.token(testClient.clientId, testClient.clientSecret) } };
//     const res = await server.inject(request);

//     expect(res.result).to.equal('ok');
// });

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
    clientId: '67nqujeju3fuie0clrpo1ma8bt',
    clientSecret: '1eub5hraovq3ku8nbt65e10hrkb9vouhdt8bn9fa7d977v8df5qi'
};

internals.clientList = ['67nqujeju3fuie0clrpo1ma8bt'];

internals.inValidHeader = function (clientId, clientSecret) {

    return 'Bearer IiOiI0dWg5b2ZydGs3NWs2bWs2OXJsa2YwaWdrMyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibWFuYWdlY3JlZGl0Y2FyZFwvYWxsIiwiYXV0aF90aW1lIjoxNTQ5NzQyMTY5LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9QWXhKZUZROGgiLCJleHAiOjE1NDk3NDU3NjksImlhdCI6MTU0OTc0MjE2OSwidmVyc2lvbiI6MiwianRpIjoiNzljNDg2NGQtNDI0NS00OWRiLThjOWEtYjI1ZmI3YzdjYzcwIiwiY2xpZW50X2lkIjoiNHVoOW9mcnRrNzVrNm1rNjlybGtmMGlnazMifQ.Xu_Y46jVujjumt2iHj4mbOfumTb-upUVBV5rFGz0BWE9JW8NPPNBtT1Kkwf_LW3JRFGa7p0PXdeKapxVGAokh92sTtauJTpTKZpbTVn9UtxG9Ak3emim9mwDtIeRbL5YpXSM7dUib8L4997URGSnEcF0MzwWUD4z6r44x2EvGQMBgbxAuXPty0iyD4o1H6uF9DdfsiuaEZA7tmAr2qscZLbolQrzvKAONHUAeKa_TpqxaH2pc7IjtIsykhrycPS1oYHZY6z9kUT-JATZuhIFQ-79heYON5Ik185spPfrp3anxsCXdtHy04QwJd2MI9HZj5ZVj-9z1aEE5Af_L6a4eQ';
    //add AWS Cognito oauth/token call here ... return 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64');
};

internals.header = function () {

    return 'Bearer eyJraWQiOiJoWnYwczdPXC96amdteEhNTldHb0tROURWOFNEazlZd1ZGYTg2RzlBdUgxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2N25xdWplanUzZnVpZTBjbHJwbzFtYThidCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibWFuYWdlY3JlZGl0Y2FyZFwvYWxsIiwiYXV0aF90aW1lIjoxNTQ5NzYwMjc5LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9WRFZJMFNLWWIiLCJleHAiOjE1NDk3NjM4NzksImlhdCI6MTU0OTc2MDI3OSwidmVyc2lvbiI6MiwianRpIjoiY2ZjYjQyYjQtZjkyYS00OWRhLTk1OTEtMzUyNjAyY2I0YTY2IiwiY2xpZW50X2lkIjoiNjducXVqZWp1M2Z1aWUwY2xycG8xbWE4YnQifQ.AiNDFaJT4_2CKrlhi0AbxFnqUMKpmibYN9kXfjQ6Z6RuZ160vxMlaCNC17XTb33q1RY1nTfSaTaNPKwLEjVWguM2IYEovKfjPmSuybLviWwXX6EMppDXqqe1DJO2AXok9D72RZD8poHShae1FUivGdQ-OyryFRYD8xGfIbots2T9GobzNRoGwxyv7W8s8i7yCh-b5sA8p0urz3A_PNsJxstFY0BjomFnGqZOdOXXmwB1hq8KSbv5n95C7UUvOIIAC9txkGzd040MSl9oxz7ZDhOlbwHG-py8MNGvBNPnLQQ4OHUCuvyWMetZdl7XB-eo4DQ4mMt24J5d_Le3k5Aj3A';
};

internals.token = function () {

    return 'eyJraWQiOiJoWnYwczdPXC96amdteEhNTldHb0tROURWOFNEazlZd1ZGYTg2RzlBdUgxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2N25xdWplanUzZnVpZTBjbHJwbzFtYThidCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibWFuYWdlY3JlZGl0Y2FyZFwvYWxsIiwiYXV0aF90aW1lIjoxNTQ5NzYwMjc5LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9WRFZJMFNLWWIiLCJleHAiOjE1NDk3NjM4NzksImlhdCI6MTU0OTc2MDI3OSwidmVyc2lvbiI6MiwianRpIjoiY2ZjYjQyYjQtZjkyYS00OWRhLTk1OTEtMzUyNjAyY2I0YTY2IiwiY2xpZW50X2lkIjoiNjducXVqZWp1M2Z1aWUwY2xycG8xbWE4YnQifQ.AiNDFaJT4_2CKrlhi0AbxFnqUMKpmibYN9kXfjQ6Z6RuZ160vxMlaCNC17XTb33q1RY1nTfSaTaNPKwLEjVWguM2IYEovKfjPmSuybLviWwXX6EMppDXqqe1DJO2AXok9D72RZD8poHShae1FUivGdQ-OyryFRYD8xGfIbots2T9GobzNRoGwxyv7W8s8i7yCh-b5sA8p0urz3A_PNsJxstFY0BjomFnGqZOdOXXmwB1hq8KSbv5n95C7UUvOIIAC9txkGzd040MSl9oxz7ZDhOlbwHG-py8MNGvBNPnLQQ4OHUCuvyWMetZdl7XB-eo4DQ4mMt24J5d_Le3k5Aj3A';
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
                // console.log(decodedClaims);
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
