import { GiftRegistryPage } from "@/components/gift-registry-page";
import { getPublicData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPublicData();

  return <GiftRegistryPage initialData={data} />;
}
