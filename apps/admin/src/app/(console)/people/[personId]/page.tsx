import { PersonRecord } from "./person-record";

/**
 * `params` is async in Next 16, so the route segment stays a server component
 * and hands the resolved id to the client screen.
 */
export default async function PersonPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  return <PersonRecord personId={personId} />;
}
