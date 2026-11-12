import { redirect } from "next/navigation";

// The exercise has one business; real booking links always carry a slug.
export default function Home() {
  redirect("/booking/gold-spa");
}
