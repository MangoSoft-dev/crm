import moment from 'moment'
import md5 from 'md5';
import _ from 'lodash'
import jwt from "jsonwebtoken";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'
import { GraphQLError } from 'graphql';
import { OAuth2Client } from 'google-auth-library'

import ServiceBase, { console } from './ServiceBase';
import { Emails } from '../integrations/emails';

import { LOGIN_CONFIG, SECRET, SECRET_REFRESH, GOOGLE_CLIENT_ID, GOOGLE_SECRET } from "../core/constants";

export class Authentication extends ServiceBase {

    route = 'Services/Authentication'
    key = 'AUTH'

    /**
     * Internal method to create authentication credentials (JWT token and refresh token) for a user after successful validation.
     * 
     * @param user - The user record from the database.
     * @param password - The password provided during the login attempt.
     * @param ip - The IP address of the user making the request.
     * @param validatePassword - If true, the method will validate the password and check login attempts/status. Defaults to true.
     * @returns An object containing the user `id`, the main `token`, and the `refreshToken`.
     */
    async createCredentials(user: any, password: string, ip: string, validatePassword = true) {
        console.log(this.key, this.route, "createCredentials", user, password, ip, validatePassword)

        //validate password if required
        if (validatePassword) {

            let momentNow = moment()

            //validate if password is correct
            if (user.password != password) {
                //validate attemps for same user
                if (user.login_attemps >= LOGIN_CONFIG.maxAttemps && (user.last_login_attemps && moment(user.last_login_attemps).add(1, 'minutes') > momentNow)) {
                    //saca error por tiempo
                    throw new GraphQLError("loginMaxAttemps", {
                        extensions: {
                            code: 'loginMaxAttemps',
                            meesage: 'Maximum attempts made try within one minute',
                            values: {
                                time: moment(user.last_login_attemps).add(1, 'minutes').diff(moment(), 'seconds')
                            }
                        }
                    });
                }


                //await this.db.execute(dbInstances.WRITE, SQLString.format('UPDATE security.users SET login_attemps= ?, last_login_attemps= ? WHERE id = ?', [user.login_attemps + 1, moment().toISOString(), user.id]))
                throw new GraphQLError("loginInvalid", { extensions: { code: 'loginInvalid', meesage: 'Invalid user or password' } });
            }

            //validate status
            // : if no active
            if (user.status != 1) {
                if (user.status == -98) {
                    const guid = uuidv4()
                    await this.createSecurityCode(user.id, "FORCE_CHANGE_PASSWORD", guid, 30)
                    const emailArray = user.email.split('@')
                    //enviar email y retornar 
                    return { code: "LOGIN_FORCE_CHANGE_PASSWORD", message: "A code has been sent to your email, please enter it", data: { guid, email: `${emailArray[0].substring(0, 3)}****@${emailArray[1].substring(0, 3)}****` }, __typename: "CustomResponse" }
                }

                throw new GraphQLError("loginBlocked", { extensions: { code: 'loginBlocked', meesage: 'User blocked' } });
            }

            //validate ip restriction
            if (LOGIN_CONFIG.validateIp && user.ip_restricted != '*' && user.ip_restricted != ip) {
                //saca error por ser una ip diferente
                throw new GraphQLError("loginInvalidIp", { extensions: { code: 'loginInvalidIp', meesage: 'Invalid ip' } });
            }


            //validate otp
            if (user.validateOtp == 1 || (LOGIN_CONFIG.validateChangeIp && user.last_ip_connected != ip)) {
                const guid = uuidv4()
                await this.createSecurityCode(user.id, "LOGIN_OTP", guid)
                const emailArray = user.email.split('@')

                //enviar email y retornar 
                return { code: "LOGIN_VALIDATE_OTP", message: "A code has been sent to your email, please enter it", data: { guid, email: `${emailArray[0].substring(0, 3)}****@${emailArray[1].substring(0, 3)}****` }, __typename: "CustomResponse" }

            }
        }

        //make token
        const token = jwt.sign(
            {
                id: user.id,
                userId: user.id,
                username: user.username,
                email: user.email
            },
            SECRET,
            { expiresIn: LOGIN_CONFIG.expiresIn }
        );

        console.log(this.key, this.route, "token", token)

        //make refresh token
        const refreshToken = jwt.sign({
            id: user.id,
        }, SECRET_REFRESH, { expiresIn: '1w' });

        //update last activity
        await this.db.query(`
            UPDATE 
                security.users 
            SET 
                last_activity = $1, 
                last_ip_connected = $2, 
                login_attemps = 0,
                last_login_attemps = $3, 
                validate_otp = 0 
            WHERE 
                id = $4;`
            , [moment().toISOString(), ip, moment().toISOString(), user.id]
        )

        //return credentials
        return { id: user.id, token, refreshToken, __typename: "Authentication" }

    }

    /**
     * Standard login method using a username (or email) and password. Handles user impersonation and credentials creation.
     * 
     * @param args - Object containing `username` and `password`.
     * @param identity - The user identity object containing the `ip` address.
     * @returns A promise resolving to the user credentials (tokens).
     */
    async login(args: any, identity: any) {
        try {
            const { username, password } = args;
            const { ip } = identity

            console.log(this.key, this.route, "args", args)

            //validate if username and password are sent
            if (username && password) {

                //suplantation of user
                let splitUser = username.split(':')
                let masterUser
                let currentUserName = splitUser[0]

                console.log(this.key, this.route, "login", "splitUser => ", splitUser);

                if (splitUser.length > 1) {
                    masterUser = splitUser[1]

                    //validate if master user exists
                    //TODO: validate rol o permission to suplantate
                    masterUser = await this.db.query(`SELECT id FROM users WHERE (username = $1 or email = $2) and password = $3`,
                        [masterUser, masterUser, md5(password)])

                    console.log(this.key, this.route, "login", "masterUser => ", masterUser);

                    //if not have master user throw error
                    if (!masterUser)
                        throw new GraphQLError("loginInvalid", { extensions: { code: 'loginInvalid', meesage: 'Invalid user or password' } });
                }

                //get current user data
                const result = await this.db.getFirst(
                    `
                        SELECT 
                            id,
                            password,
                            username,
                            email,
                            password,
                            login_attemps,
                            last_login_attemps,
                            ip_restricted,
                            last_ip_connected,
                            status,
                            validate_otp
                        FROM 
                            security.users 
                        WHERE 
                            (username = $1 or email = $2)
                            AND deleted = 0
                    `,
                    [currentUserName, currentUserName]
                );

                console.log(this.key, this.route, "login", "result => ", result);

                //if result exists create credentials
                if (result) {
                    //if masteruser has been sent, use master user password to validate
                    return await this.createCredentials(result, masterUser ? result.password : md5(password), ip)
                }
                else
                    throw new GraphQLError("loginInvalid", { extensions: { code: 'loginInvalid', meesage: 'Invalid user or password' } });
            }
            else
                throw new GraphQLError("loginInvalid", { extensions: { code: 'loginInvalid', meesage: 'Invalid user or password' } });
        } catch (exc) {
            console.error(this.key, this.route, exc)
            throw new GraphQLError("loginInvalid", { extensions: { meesage: 'A error occurred' } });
        }
    }

    /**
     * Login method using a One-Time Password (OTP) code instead of a standard password.
     * 
     * @param args - Object containing the security code `id` and the `code` itself.
     * @param identity - The user identity object containing the `ip` address.
     * @returns A promise resolving to the user credentials (tokens).
     */
    async loginOTP(args: any, identity: any) {
        const { id, code } = args;
        const { ip } = identity

        console.log(this.key, this.route, "args", args)

        //validate if id and code are sent
        const resultValidation = await this.validateSecurityCode("LOGIN_OTP", id, code)

        //if validateion is ok, get user data and create credentials
        if (resultValidation) {
            const result = await this.db.getFirst(
                `
                    SELECT 
                        id,
                        username,
                        email,
                        ip_restricted,
                        status
                    FROM 
                        security.users 
                    WHERE 
                        id = $1
                        AND deleted = 0
                `,
                [resultValidation.userId]
            );

            console.log(this.key, this.route, "result", result)
            if (result) {
                return await this.createCredentials(result, "", ip, false)
            }

        }
        throw new GraphQLError("loginInvalidOtp", { extensions: { code: 'loginInvalidOtp', meesage: 'Invalid user or password' } });
    }

    /**
     * Method to resend a One-Time Password (OTP) to the user's registered email.
     * 
     * @param args - Object containing the `id` representing the OTP request session, and an optional `code` type (defaults to 'LOGIN_OTP').
     * @param identity - The identity object of the requesting user.
     * @returns A promise resolving to a standard response containing the new request GUID and masked email.
     */
    async loginOTPResendCode(args: any, identity: any) {

        const { id, code = 'LOGIN_OTP' } = args
        console.log(this.key, this.route, 'loginOTPResendCode', "args", args)

        //get code data
        const resultCode = await this.db.getFirst(
            `
                SELECT 
                    sc.id,
                    sc.user_id,
                    u.email 
                FROM 
                    security.security_codes sc 
                    INNER JOIN security.users u ON u.id = sc.user_id
                WHERE 
                    entity = $1
                    AND entity_id = $2
            `,
            [code, id]
        )


        console.log(this.key, this.route, 'loginOTPResendCode', "resultCode", resultCode)

        if (!resultCode)
            throw new GraphQLError("loginInvalid", { extensions: { code: 'loginInvalid', meesage: 'Invalid code' } });

        //create new code
        const guid = uuidv4()
        await this.createSecurityCode(resultCode.user_id, code, guid)

        //send email
        const emailArray = resultCode.email.split('@')
        console.log(this.key, this.route, 'loginOTPResendCode', "guid", guid, emailArray)


        return { code: "LOGIN_VALIDATE_OTP", message: "A code has been sent to your email, please enter it", data: { guid, email: `${emailArray[0].substring(0, 3)}****@${emailArray[1].substring(0, 3)}****` }, __typename: "CustomResponse" }
    }

    /**
     * Login method using Google OAuth callback tokens.
     * 
     * @param args - Object containing the Google OAuth `token`.
     * @param identity - The user identity object containing the `ip` address.
     * @returns A promise resolving to the user credentials (tokens).
     */
    async loginGoogle(args: any, identity: any) {
        try {
            const { token } = args
            const { ip } = identity

            const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);

            if (token) {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
                    // Or, if multiple clients access the backend:
                    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
                });


                const payload: any = ticket.getPayload();
                const userid = payload['sub'];

                const result = await this.db.getFirst(
                    `
                        SELECT 
                            id,
                            username,
                            email,
                            password,
                            login_attemps,
                            ip_restricted,
                            last_ip_connected,
                            status,
                            validate_otp
                        FROM 
                            security.users 
                        WHERE 
                            (google_id = $1 OR email = $2)
                    `,
                    [userid, payload.email]
                );

                if (result) {
                    if (!result.google_id)
                        await this.db.query('UPDATE security.users SET google_id = $1 WHERE email = $2', [userid, payload.email])

                    return await this.createCredentials(result, result.password, ip)
                }
                else
                    throw new GraphQLError("loginInvalid", { extensions: { code: 'loginInvalid', meesage: 'Invalid user or password' } });
            } else
                throw new GraphQLError("loginInvalid", { extensions: { code: 'loginInvalid', meesage: 'Invalid user or password' } });

        } catch (exc) {
            console.error(this.key, this.route, exc)
            throw exc;
        }
    }

    /**
     * Login method using Facebook OAuth access tokens.
     * 
     * @param args - Object containing the Facebook `token` and the associated user `id`.
     * @param identity - The user identity object.
     * @returns A promise resolving to the user credentials (tokens).
     */
    async loginFacebook(args: any, identity: any) {
        try {
            const { token, id } = args
            if (token) {

                let resultFace = await axios({
                    method: 'get',
                    url: `https://graph.facebook.com/${id}?fields=birthday,email,hometown&access_token=${token}`
                })

                const result = await this.db.getFirst(
                    `
                        SELECT 
                            id,
                            username,
                            email,
                            password,
                            ip_restricted,
                            login_attemps,
                            last_login_attemps,
                            last_ip_connected,
                            last_activity,
                            validate_otp
                        FROM 
                            security.users 
                        WHERE 
                            facebookId = $1
                    `,
                    [resultFace.data.id]
                );

                if (result) {
                    const tokenValue = jwt.sign(
                        {
                            id: result.id,
                            userId: result.id,
                            username: result.username,
                            email: result.email
                        },
                        SECRET,
                        { expiresIn: '60m' }
                    );

                    this.db.query('UPDATE security.users SET last_activity = ? WHERE id = ?', [moment().toISOString(), result.id])

                    return { token: tokenValue, __typename: "Authentication" };
                } else throw new Error("username or password invalid");
            } else
                throw new Error("invalid data")

        } catch (exc) {
            console.error(this.key, this.route, exc)
            throw exc;
        }
    }

    /**
     * Initiates the password recovery process by generating a temporary password and dispatching an email to the user.
     * 
     * @param args - Object containing the user's `email`.
     * @param identity - The user identity object making the request.
     * @returns A promise resolving to a standard response object with masked email info.
     */
    async recoveryPassword(args: any, identity: any) {

        const { email } = args
        const date = moment().toISOString();

        //get user data by email
        const result = await this.db.getFirst(
            `
                SELECT
                    id,
                    username,
                    email
                FROM
                    security.users 
                WHERE 
                    email = $1
            `, [email]
        );


        if (result) {
            //create new password
            const newPassword = Math.random().toString(36).slice(-8);
            await this.db.query(`
                    UPDATE 
                        security.users
                    SET 
                        password = md5($1::text),
                        status = -98
                    WHERE 
                        id = $2
                `, [newPassword, result.id]
            )

            console.log(this.key, this.route, "newPassword", newPassword)
            //TODO: translate email or use template
            //send email
            //await Emails.getProvider().registerEmail(result.id, "RECOVERY_PASSWORD", result.id, result.email, "Change Password", `A temporary password has been created: ${newPassword}`)
            await Emails.getProvider().sendEmail('noreply@mangosoft.dev', result.email, "Change Password", `A temporary password has been created: ${newPassword}`)

            const emailArray = result.email.split('@')
            return {
                code: 'ok',
                message: "Check your email for the new password",
                data: { email: `${emailArray[0].substring(0, 3)}****@${emailArray[1].substring(0, 3)}****` },
                __typename: "CustomResponse"
            }
        }

        //If no user found
        throw new GraphQLError("DB_NoAffectedRows", { extensions: { code: 'invalid_data', result: 'Invalid credentials' } });

    }

    /**
     * Forces a password change using a security code. Typically used when a user's status is set to require a forced change (e.g., status = -98).
     * 
     * @param args - Object containing the security `key`, the `newPassword`, and the OTP `code`.
     * @returns A promise resolving to a success message response.
     */
    async forceChangePassword(args: any) {
        const { key, newPassword, code } = args
        const date = moment().toISOString();

        //validate code
        const resultValidation = await this.validateSecurityCode("FORCE_CHANGE_PASSWORD", key, code)
        if (resultValidation && resultValidation.entity_id === key) {

            //get user data
            const user = await this.db.getFirst(
                `
                    SELECT
                        id,
                        email
                    FROM
                        security.users 
                    WHERE 
                        id = $1
                `, [resultValidation.user_id]);

            //update password   
            await this.db.query(
                `
                    UPDATE 
                        security.users
                    SET 
                        password = md5($1),
                        status = 1
                    WHERE 
                        id = $2
                `, [newPassword, user.id]
            )

            //TODO: translate email or use template
            //send email
            await Emails.getProvider().registerEmail(user.id, "FORCE_CHANGE_PASSWORD", user.id, user.email, "Change Password", `Your password has been changed successfully`)

            return {
                code: 'ok',
                message: "Password has been changed",
                __typename: "CustomResponse"
            }

        }

        throw new GraphQLError("loginInvalidOtp", { extensions: { code: 'loginInvalidOtp', meesage: 'Invalid credentials' } });
    }

    /**
     * Refreshes the user authentication session by validating a refresh token and issuing new credentials.
     * 
     * @param args - Object containing the `token` (the refresh JWT).
     * @param identity - The user identity object containing the `ip` address.
     * @returns A promise resolving to new user credentials (tokens).
     */
    async refreshToken(args: any, identity: any) {
        try {
            const { token } = args;
            const { ip } = identity

            //decode token
            let decodeToken: any = jwt.verify(token, SECRET_REFRESH);

            if (decodeToken.id) {
                //get user data
                const result = await this.db.getFirst(
                    `
                        SELECT 
                            id,
                            username,
                            email,
                            password,
                            login_attemps,
                            ip_restricted,
                            last_ip_connected,
                            status
                        FROM 
                            security.users 
                        WHERE 
                            id= $1
                    `,
                    [decodeToken.id]
                );

                if (result) {
                    //create new credentials
                    return await this.createCredentials(result, result.password, ip, false)
                }
                else
                    throw new GraphQLError("loginInvalid", { extensions: { code: 'loginInvalid', meesage: 'Invalid credentials' } });
            }
            else
                throw new GraphQLError("loginInvalid", { extensions: { code: 'loginInvalid', meesage: 'Invalid credentials' } });

        } catch (exc) {
            throw 'Invalid credentials';
        }
    }
}