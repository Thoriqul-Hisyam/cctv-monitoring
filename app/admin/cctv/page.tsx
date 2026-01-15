import { getCctvs } from "@/actions/cctv";
import CCTVTable from "@/components/admin/CCTVTable";

export default async function Page() {
  const data = await getCctvs(); // ✅ DI SINI TEMPATNYA

  return <CCTVTable data={data} />;
}
