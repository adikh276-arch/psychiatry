import { PsychHub } from '@/components/hub/PsychHub';

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <PsychHub />;
}
