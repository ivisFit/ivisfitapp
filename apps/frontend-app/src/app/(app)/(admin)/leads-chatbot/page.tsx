import { redirect } from "next/navigation";
import { profeWebChatbotRoute } from "@/routes/paths";

export default function Page() {
  redirect(profeWebChatbotRoute());
}
