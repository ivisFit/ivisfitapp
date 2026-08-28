import { redirect } from "next/navigation";
import { profeCatalogoAlimentosRoute } from "@/routes/paths";

export default function Page() {
  redirect(profeCatalogoAlimentosRoute());
}
