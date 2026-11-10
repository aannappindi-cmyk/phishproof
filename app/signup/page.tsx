import { redirect } from "next/navigation";
import Nav, { Footer } from "@/components/Nav";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <>
      <Nav />
      <main className="wrap">
        <AuthForm mode="signup" />
      </main>
      <Footer />
    </>
  );
}
