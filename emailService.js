import SibApiV3Sdk from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

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
