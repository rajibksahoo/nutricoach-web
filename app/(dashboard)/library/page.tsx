import { redirect } from "next/navigation";
import { firstEnabledPath } from "@/lib/features";

export default function LibraryIndex() {
  // Was a hard redirect to /library/exercises, which becomes a dead end the
  // moment the Fitness group is switched off.
  redirect(firstEnabledPath("library"));
}
