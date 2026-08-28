import { redirect } from "next/navigation";
import { profeAlumnasAdmisionesRoute } from "@/routes/paths";

export default function Page() {
  redirect(profeAlumnasAdmisionesRoute());
}
