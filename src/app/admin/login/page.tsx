import type { Metadata } from "next";
import LoginPage from "@/containers/admin/login-page/LoginPage";

export const metadata: Metadata = {
  title: "Admin Login | John Carlo",
  // description: "Secure admin login page for managing and updating portfolio content.",
  // robots: {
  //   index: false,
  //   follow: false,
  // },
};

export default function Login() {
  return <LoginPage />
}
