// importing the dependencies
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { json } from 'body-parser';
import { GraphQLError } from 'graphql';
import { expressMiddleware } from '@as-integrations/express5';
import helmet from 'helmet';
// import { createSocketServer } from './socket';
// import { startCrons } from './crons'

import { PORT } from './core/constants'
// import upload from './upload';
import authConfig from './resolvers/auth'
// import dataConfig from './graphql/data'

import { jwtValidation, headerValidation, jwtValidationFiles } from './core/security/authStrategy'
// import db from '../src/db'
// import { PORT } from '../src/constants'

//console.log("Starting server on port:", process.env)

const startServer = async () => {
    // defining the Express app
    const app = express();

    // enabling CORS for all requests
    app.use(express.json({ limit: "50mb" }))
    app.use(cors({
        "origin": "*",
        "methods": "PUT,POST",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
    }));

    app.use(json({ limit: '50mb' }));

    ///security
    app.use(helmet())
    //Reduce Fingerprinting
    app.disable('x-powered-by')

    //passport stuff
    passport.use(headerValidation)
    passport.use(jwtValidation)
    passport.use("files", jwtValidationFiles)
    passport.initialize()

    /* AUTH SERVER */
    const publicServer = authConfig()
    await publicServer.start();

    //Sevidor de auth
    app.use(
        '/api/auth',
        cors(),
        json(),
        (req: any, res, next) => {
            passport.authenticate('headerapikey', { session: false, failureRedirect: '/api/unauthorized' }, (err: any, ctx: any, info: any) => {
                if (ctx) {
                    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
                    req.ctx = { ip };
                    next()
                }
                else {
                    throw new GraphQLError("UnAuthenticated", {
                        extensions: {
                            code: 'UnAuthenticated',
                            meesage: 'Invalid Authentication',
                        }
                    });
                }
            })(req, res, next)
        },
        expressMiddleware(publicServer, {
            context: async ({ req }: any) => ({ ...req.ctx })
        }),
    );

    // const dataServer = dataConfig()
    // await dataServer.start();


    // //Servidor de data
    app.use(
        '/api/data',
        cors(),
        json(),
        (req: any, res, next) => {
            passport.authenticate('jwt', { session: false }, (err: any, ctx: any, info: any) => {
                if (ctx) {
                    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
                    req.ctx = { ...ctx, ip };
                }
                else {
                    //throw new Error("UnAuthenticated")
                    throw new GraphQLError("UnAuthenticated", {
                        extensions: {
                            code: 'UnAuthenticated',
                            meesage: 'Invalid Authentication',
                        }
                    });
                }
                next()
            })(req, res, next)
        },
        //expressMiddleware(privateServer),
        // expressMiddleware(dataServer, {
        //     context: async ({ req }: any) => ({ ...req.ctx })
        // })
    );

    // app.put('/api/upload',
    //     cors({}),
    //     (req: any, res, next) => {
    //         passport.authenticate('files', { session: false }, (err: any, ctx: any, info: any) => {
    //             if (ctx) {
    //                 const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    //                 req.ctx = { ...ctx, ip };
    //             }
    //             else {
    //                 //throw new Error("UnAuthenticated")
    //                 throw new GraphQLError("UnAuthenticated", {
    //                     extensions: {
    //                         code: 'UnAuthenticated',
    //                         meesage: 'Invalid Authentication',
    //                     }
    //                 });
    //             }
    //             next()
    //         })(req, res, next)
    //     },
    //     upload.single('file'),
    //     (req: any, res, next) => {
    //         res.json({ result: true, files: req.files, message: 'File uploaded successfully!' });
    //     },

    // );

    // defining an endpoint to return all ads
    app.use("/api", (req, res) => {
        res.send('API ONLINE!!')
    })


    // starting the server
    const httpServer = app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`);
    });

    // createSocketServer(httpServer)
    //startCrons()

}

//start Server function
startServer()