
// import { Configuration, EmailsApi, EmailMessageData } from '@elasticemail/elasticemail-client-ts-axios';

// import * as CONFIG from '../../../constants'
// import { EmailProviderBase } from '../base'
// import Logger from '../../../utils/Logger';

// export class Elasticemail extends EmailProviderBase {

//     config: Configuration

//     constructor(logger?: Logger) {
//         super(logger)

//         this.logger.console({ key: 'Emails', methodName: 'Elasticemail' }, 'constructor', CONFIG.ELASTCEEMAIL_API_KEY)
//         this.config = new Configuration({
//             apiKey: CONFIG.ELASTCEEMAIL_API_KEY
//         });
//     }

//     override async sendEmail(from: string, to: string, subject: string, body: string, cc?: string) {

//         const msg: EmailMessageData = {
//             Recipients: [
//                 {
//                     Email: to,
//                     Fields: {
//                         name: "Eservices"
//                     }
//                 }
//             ],
//             Content: {
//                 Body: [
//                     {
//                         ContentType: "HTML",
//                         Charset: "utf-8",
//                         Content: body
//                     }
//                 ],
//                 From: from,
//                 Subject: subject
//             }
//         }

//         this.logger.console({ key: 'Emails', methodName: 'Elasticemail' }, 'sendEmail', msg)
//         const emailsApi = new EmailsApi(this.config);

//         await emailsApi.emailsPost(msg)

//         return 'Elasticemail'
//     }

// }

// export default Elasticemail
