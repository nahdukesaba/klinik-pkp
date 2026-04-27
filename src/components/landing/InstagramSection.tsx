const INSTAGRAM_EMBED_URL = "https://www.instagram.com/bp3kp_sumatera2/embed/";

export default function InstagramSection() {
  return (
    <section className="relative overflow-hidden bg-[#071f24] py-12 lg:py-14">
      <div className="container mx-auto px-3 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1040px] xl:max-w-[1120px]">
          <h2 className="mb-4 text-center text-2xl font-bold text-white sm:text-3xl">
            Ikuti Kami di Instagram
          </h2>

          <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_32px_90px_rgba(0,0,0,0.28)]">
            <iframe
              src={INSTAGRAM_EMBED_URL}
              title="Embed Instagram BP3KP Sumatera II"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="block h-[620px] w-full bg-white sm:h-[700px] lg:h-[760px]"
              style={{ border: 0 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
