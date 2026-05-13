import InformasiDynamicPage, {
  getInformasiMetadata,
  getInformasiStaticParams,
} from "@/components/informasi/InformasiDynamicPage";

import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return getInformasiMetadata(slug);
}

export default async function InformasiDynamicRoute({ params }: PageProps) {
  const { slug } = await params;
  return <InformasiDynamicPage slug={slug} />;
}

export function generateStaticParams() {
  return getInformasiStaticParams();
}
