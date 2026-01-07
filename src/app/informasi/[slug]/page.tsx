import BahanBangunanPage from '../BahanBangunanPage';
import FaqPage from '../FaqPage';
import KegiatanKrsPage from '../KegiatanKrsPage';
import KontakPage from '../KontakPage';
import PeraturanPage from '../PeraturanPage';
import PerizinanPage from '../PerizinanPage';
import TentangPage from '../TentangPage';

interface InformasiParams {
  slug: string;
}

export default async function InformasiDynamicPage({
  params,
}: {
  params: Promise<InformasiParams>;
}) {
  const { slug } = await params;

  switch (slug) {
    case 'bahan-bangunan':
      return <BahanBangunanPage />;
    case 'faq':
      return <FaqPage />;
    case 'kegiatan-krs':
      return <KegiatanKrsPage />;
    case 'kontak':
      return <KontakPage />;
    case 'peraturan':
      return <PeraturanPage />;
    case 'perizinan':
      return <PerizinanPage />;
    case 'tentang':
      return <TentangPage />;
    case 'kebijakan-privasi':
      return (
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">Kebijakan Privasi</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p>Halaman kebijakan privasi sedang dalam pengembangan.</p>
          </div>
        </div>
      );
    case 'syarat-ketentuan':
      return (
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">Syarat & Ketentuan</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p>Halaman syarat & ketentuan sedang dalam pengembangan.</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">404 - Halaman tidak ditemukan</h1>
          <p className="mt-4">Halaman yang Anda cari tidak tersedia.</p>
        </div>
      );
  }
}
