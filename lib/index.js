'use strict';

// Load modules

const Boom = require('boom');
const Hoek = require('hoek');

// Declare internals

const internals = {};


exports.plugin = {
    pkg: require('../package.json'),
    register: function (server) {

        server.auth.scheme('oauth2Token', internals.implementation);
    }
};


internals.implementation = function (server, options) {

    Hoek.assert(options, 'Missing Bearer auth strategy options');
    Hoek.assert(typeof options.validate === 'function', 'options.validate must be a valid function in basic scheme');

    const settings = Hoek.clone(options);

    const scheme = {
        authenticate: async function (request, h) {

            let authorization = request.headers.authorization;

            if (!authorization) {
                // Let's try to see if access_token is part of query
                const access_token = request.query.access_token;
                authorization = 'Bearer ' + access_token;

                if (request.payload && !access_token) {

                    // Let's try to see if access_token is part of payload
                    authorization = 'Bearer ' + request.payload.access_token;

                    if (!authorization) {
                        throw Boom.unauthorized(null, 'Bearer ', settings.unauthorizedAttributes);
                    }
                }
                else if (!request.payload && !access_token) {
                    throw Boom.unauthorized(null, 'Bearer ', settings.unauthorizedAttributes);
                }
            }

            const parts = authorization.split(/\s+/);

            if (parts[0].toLowerCase() !== 'bearer') {
                throw Boom.unauthorized(null, 'Bearer', settings.unauthorizedAttributes);
            }

            if (parts.length !== 2) {
                throw Boom.badRequest('Bad HTTP authentication header format', 'Bearer');
            }

            const { isValid, credentials, response } = await settings.validate(request, parts[1], h);

            if (response !== undefined) {
                return h.response(response).takeover();
            }

            if (!isValid) {
                return h.unauthenticated(Boom.unauthorized('Bad username or password', 'Bearer', settings.unauthorizedAttributes), credentials ? { credentials } : null);
            }

            if (!credentials ||
                typeof credentials !== 'object') {

                throw Boom.badImplementation('Bad credentials object received for Bearer auth validation');
            }

            return h.authenticated({ credentials });

        }
    };

    return scheme;
};
