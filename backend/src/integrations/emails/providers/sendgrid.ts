
// import sgMail from '@sendgrid/mail'

// import * as CONFIG from '../../../constants'
// import { EmailProviderBase } from '../base'
// import Logger from '../../../utils/Logger'

// export class SendGrid extends EmailProviderBase {

//     constructor(Logger?: Logger) {
//         sgMail.setApiKey(CONFIG.SENDGRID_API_KEY)
//         super(Logger)
//     }

//     override async sendEmail(from: string, to: string, subject: string, body: string, cc?: string) {

//         const msg = {
//             to: to,
//             from: from,
//             subject: subject,
//             html: body,
//         }

//         await sgMail.send(msg)

//         return 'SendGrid'
//     }

// }

// export default SendGrid
