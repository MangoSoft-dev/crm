export const login = {
    field: 'login',
    requestTemplate: {
        class: 'Authentication',
        method: 'login',
    },
    type: 'Mutation',
} 

export const loginOTP = {
    field: 'loginOTPResendCode',
    requestTemplate: {
        class: 'Authentication',
        method: 'loginOTP',
    },
    type: 'Mutation',
}

export const loginOTPResendCode = {
    field: 'loginOTPResendCode',
    requestTemplate: {
        class: 'Authentication',
        method: 'loginOTPResendCode',
    },
    type: 'Mutation',
}

// export const loginFacebook = {
//     field: 'loginFacebook',
//     requestTemplate: {
//         class: 'Authentication',
//         method: 'loginFacebook',
//     },
//     type: 'Mutation',
// }

// export const loginGoogle = {
//     field: 'loginGoogle',
//     requestTemplate: {
//         class: 'Authentication',
//         method: 'loginGoogle',
//     },
//     type: 'Mutation',
// }

export const recoveryPassword = {
    field: 'recoveryPassword',
    requestTemplate: {
        class: 'Authentication',
        method: 'recoveryPassword',
    },
    type: 'Mutation',
}

export const forceChangePassword = {
    field: 'forceChangePassword',
    requestTemplate: {
        class: 'Authentication',
        method: 'forceChangePassword',
    },
    type: 'Mutation',
}

export const refreshToken = {
    field: 'refreshToken',
    requestTemplate: {
        class: 'Authentication',
        method: 'refreshToken',
    },
    type: 'Mutation',
}

