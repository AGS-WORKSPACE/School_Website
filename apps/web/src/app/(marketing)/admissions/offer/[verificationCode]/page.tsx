import { OfferResponse } from "./offer-response";

export default async function OfferPage({ params }: { params: Promise<{ verificationCode: string }> }) {
  const { verificationCode } = await params;
  return <OfferResponse verificationCode={verificationCode} />;
}
