import Nav, { Footer } from "@/components/Nav";
import Practice from "@/components/Practice";
import { requireUser } from "@/lib/auth";
import { SCAM_TYPES } from "@/lib/ai";

export default async function PracticePage() {
  const user = await requireUser();
  return (
    <>
      <Nav />
      <main className="wrap">
        <section>
          <h1 style={{ margin: "0 0 6px" }}>Practice round</h1>
          <p className="sub">
            Tell PhishProof about your club. The AI will write a realistic fake scam aimed at your members.
            Click everything that looks suspicious.
          </p>
          <Practice scamTypes={SCAM_TYPES} plan={user.plan} />
        </section>
      </main>
      <Footer />
    </>
  );
}
