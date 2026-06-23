import { PsychHub } from '@/components/hub/PsychHub';

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  return <PsychHub topicId={topicId} />;
}
