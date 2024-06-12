import SibApiV3Sdk from "@getbrevo/brevo";
import sendpulse from "sendpulse-api";
import dotenv from "dotenv";
dotenv.config();

const API_USER_ID = process.env.SENDPULSE_API_USER_ID;
const API_SECRET = process.env.SENDPULSE_API_SECRET;
const TOKEN_STORAGE = "/tmp/";

// sendpulse.init(API_USER_ID, API_SECRET, TOKEN_STORAGE, function (token) {
//   console.log("SendPulse API initialized:", token);
// });

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let apiKey = SibApiV3Sdk.ApiClient.instance.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API;

const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

export async function sendEmail(volume, unit, phoneNumber, reference) {
  sendSmtpEmail.templateId = 1;
  sendSmtpEmail.to = [{ email: "ernesco28@gmail.com", name: "Ernest Aboah" }];
  sendSmtpEmail.params = { volume, unit, phoneNumber, reference };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(
      "API called successfully. Returned data: " + JSON.stringify(data)
    );
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendContactEmail(
  firstName,
  lastName,
  email,
  phoneNumber,
  message
) {
  sendSmtpEmail.templateId = 2;
  sendSmtpEmail.to = [{ email: "ernesco28@gmail.com", name: "Ernest Aboah" }];
  sendSmtpEmail.params = { firstName, lastName, email, phoneNumber, message };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(
      "API called successfully. Returned data: " + JSON.stringify(data)
    );
  } catch (error) {
    console.error("Error sending email:", error);
  }

  // const contactEmail = {
  //   from: {
  //     name: "Ezidata Contact",
  //     email: "ernesco28@gmail.com",
  //   },
  //   to: [
  //     {
  //       email: "ernesco28@gmail.com",
  //       name: "Ernest Aboah",
  //     },
  //   ],
  //   subject: "New Contact Message",
  //   html: `<p>First Name: ${firstName}</p>
  //          <p>Last Name: ${lastName}</p>
  //          <p>Email: ${email}</p>
  //          <p>Phone Number: ${phoneNumber}</p>
  //          <p>Message: ${message}</p>`,
  // };

  // sendpulse.smtpSendMail(function (response) {
  //   console.log("Contact email sent:", response);
  // }, contactEmail);
}
