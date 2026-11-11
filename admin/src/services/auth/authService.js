// Demo credentials only. Real authentication will be added by the backend team.
export const DEMO_LOGIN = {
  email: "admin@hadiya.gov.et",
  password: "HRMS-demo-2026",
};

export function signIn({ email, password }) {
  const correctEmail = email.trim().toLowerCase() === DEMO_LOGIN.email;
  const correctPassword = password === DEMO_LOGIN.password;

  if (!correctEmail || !correctPassword) {
    throw new Error(
      "Use the demo account below. Live account login is not available yet.",
    );
  }
}
