import { redirect } from "next/navigation";

// The root URL redirects to the widget so testers can preview it directly.
// The actual embed URL for WordPress is /widget
export default function Home() {
  redirect("/widget");
}
