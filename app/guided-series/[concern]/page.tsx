import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import guidedData from "@/data/guidedSeries.json";
import { GuidedSeriesClient } from "./GuidedSeriesClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ concern: string }>;
}) {
  const { concern } = await params;
  const displayName = concern.charAt(0).toUpperCase() + concern.slice(1);
  return {
    title: `${displayName} Guided Series | TherapyMantra`,
    description: `A step-by-step therapeutic guided series for ${displayName}.`,
  };
}

export default async function GuidedSeriesPage({
  params,
}: {
  params: Promise<{ concern: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("user_id")?.value) {
    redirect("/token");
  }

  const { concern } = await params;

  // Case-insensitive lookup
  const lookupKey = Object.keys(guidedData).find(
    (k) => k.toLowerCase() === concern.toLowerCase()
  );
  const data = lookupKey ? (guidedData as any)[lookupKey] : null;

  return <GuidedSeriesClient concern={concern} data={data} />;
}
