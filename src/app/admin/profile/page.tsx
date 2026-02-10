import type { Metadata } from "next";
import ProfilePage from "@/containers/admin/profile-page/ProfilePage";

export const metadata: Metadata = {
  title: "Admin Profile | John Carlo",
  // description: "Secure admin login page for managing and updating portfolio content.",
  // robots: {
  //   index: false,
  //   follow: false,
  // },
};

export default function Profile() {
  return <ProfilePage />
}
