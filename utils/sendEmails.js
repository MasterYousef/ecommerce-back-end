const nodeMailer = require('nodemailer');

 const sendEmails = async(option) => {
const transport = nodeMailer.createTransport({
    host:process.env.email_host,
    port:process.env.email_port,
    secure:process.env.email_secure,
    auth:{
        user:process.env.email_user,
        pass:process.env.email_pass
    }
})
const emailOption = {
    from : 'Y-shop <yousef8last@gmail.com>',
    to:option.email,
    subject:option.subject,
    text:option.message
}
await transport.sendMail(emailOption);
}
module.exports = sendEmails;