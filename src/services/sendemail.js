import emailjs from "@emailjs/browser";

export const sendEmail = async (data) => {
  return emailjs.send(
    "YOUR_SERVICE_ID",
    "YOUR_TEMPLATE_ID",
    {
      user_name: data.name,
      user_email: data.email,
      admin_message: data.message,
    },
    "YOUR_PUBLIC_KEY"
  );
};
await sendEmail({
    name: user.name,
    email: user.email,
    message: "Your request has been approved."
});