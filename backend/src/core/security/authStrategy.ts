import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import jwt from 'jsonwebtoken'

//configurations
import { SECRET, SECRET_API_KEY, SECRET_FILE } from '../../core/constants';

export const jwtVerify = (token: string, next: any) => {
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Token no válido'));
        }
        
        next(null, decoded);
    });
}

export const jwtValidation = new JwtStrategy({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: SECRET }, (jwt_payload, done) => {
    return done(null, jwt_payload)
})


export const jwtValidationFiles = new JwtStrategy({ jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token"), secretOrKey: SECRET_FILE }, (jwt_payload, done) => {
    return done(null, jwt_payload)
})

export const jwtValidationLambda = (event: any) => {
    const { authorizationToken } = event

    let authorization = authorizationToken.split(' ');

    if (authorization[0] != 'bearer')
        throw Error("Invalid token")

    try {
        let decodeToken: any = jwt.verify(authorization[1], SECRET);

        return {
            isAuthorized: true,
            resolverContext: decodeToken,
            deniedFields: [],
            //ttlOverride: 10,
        }
    } catch (e) {
        throw Error("Invalid token")
    }
}

export const headerValidation = new HeaderAPIKeyStrategy({ header: 'x-api-key', prefix: '' }, false, (apikey, done) => {
    if (apikey == SECRET_API_KEY)
        return done(null, true)
    else
        return done(Error("Invalid token"), false)
})