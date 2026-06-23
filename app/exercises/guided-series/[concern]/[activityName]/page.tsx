import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GuidedActivityClient } from "./GuidedActivityClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ concern: string; activityName: string }>;
}) {
  const { activityName } = await params;
  const decoded = decodeURIComponent(activityName);
  return {
    title: `${decoded} | Guided Series | TherapyMantra`,
    description: `Reflect and journal on: ${decoded}`,
  };
}

export default async function GuidedActivityPage({
  params,
}: {
  params: Promise<{ concern: string; activityName: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("user_id")?.value) {
    redirect("/token");
  }

  const { concern, activityName } = await params;
  const decoded = decodeURIComponent(activityName);

  return <GuidedActivityClient concern={concern} activityName={decoded} />;
}
