### hapi-aws-cognito-oauth2-scheme

Lead Maintainer: [Sachin Rajput](https://github.com/sachin.rajput)

Basic authentication requires validating token generated using AWS Cognito. The `'basic'` scheme takes the following options:

- `validate` - (required) a oauth/token endpoint token with the signature `[async] function(request, basicToken, h)` where:
    - `request` - is the hapi request object of the request which is being authenticated.
    - `basicToken` - the token received from oauth/token endpoint from the client.
    - `h` - the response toolkit.
    - Returns an object `{ isValid, credentials, response }` where:
        - `isValid` - `true` if both the username was found and the password matched, otherwise `false`.
        - `credentials` - a credentials object passed back to the application in `request.auth.credentials`.
        - `response` - Optional. If provided will be used immediately as a takeover response. Can be used to redirect the client, for example. Don't need to provide `isValid` or `credentials` if `response` is provided
    - Throwing an error from this function will replace default `Boom.unauthorized` error
    - Typically, `credentials` are only included when `isValid` is `true`, but there are cases when the application needs to know who tried to authenticate even when it fails (e.g. with authentication mode `'try'`).
- `unauthorizedAttributes` - (optional) if set, passed directly to [Boom.unauthorized](https://github.com/hapijs/boom#boomunauthorizedmessage-scheme-attributes) if no custom `err` is thrown. Useful for setting realm attribute in WWW-Authenticate header. Defaults to `undefined`.

```javascript
const Hapi = require('hapi');
const JwtDecode = require('jwt-decode');
const Boom = require('boom');

let internals = {};

internals.clientList = ['xxxxx1','uuuu2'];

const validate = async (request, basicToken, h) => {

    let decodedClaims;
    try {
        decodedClaims = JwtDecode(basicToken);
    }
    catch (err) {
        throw Boom.badRequest('Bad Authorization token', 'Basic');
    }

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

const main = async () => {

    const server = Hapi.server({ port: 4000 });

    await server.register(require('hapi-oauth2-awscognito'));

    server.auth.strategy('simple', 'oauth2Token', { validate });
    server.auth.default('simple');

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            return 'welcome';
        }
    });

    await server.start();

    return server;
};

main()
.then((server) => console.log(`Server listening on ${server.info.uri}`))
.catch((err) => {

    console.error(err);
    process.exit(1);
});
```
