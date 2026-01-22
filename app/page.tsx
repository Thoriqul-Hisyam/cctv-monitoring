import { getCctvs } from "@/actions/cctv";
import HomeClient from "@/components/HomeClient";
import { type Cctv as PrismaCctv } from "@prisma/client";

type Cctv = PrismaCctv & {
  group?: { name: string; slug: string } | null;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const cctvs = await getCctvs({ publicOnly: true });

  return <HomeClient cctvs={cctvs} />;
}
