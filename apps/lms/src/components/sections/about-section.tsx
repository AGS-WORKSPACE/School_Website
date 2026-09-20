import Image from "next/image";

export function AboutSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:px-[80px]">
        <div className="relative shrink-0">
          <div className="relative h-[420px] w-[340px] overflow-hidden rounded-xl bg-muted lg:h-[437px] lg:w-[345px]">
            <Image src="/images/provost.svg" alt="Office of the Vice-Chancellor" fill className="object-cover" />
          </div>
          <div className="absolute -bottom-6 left-6 w-[280px] rounded-lg border-l-4 border-primary bg-white p-5 shadow-card-hover">
            <p className="font-display text-sm font-black text-black">OFFICE OF THE VICE-CHANCELLOR</p>
            <p className="mt-1 text-sm text-lms-red">Nnamdi Azikiwe University</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-start gap-6 pt-6">
          <span className="rounded-full bg-[#c0c2ff] px-5 py-1.5 text-sm font-medium text-[#030454]">About Us</span>
          <h2 className="text-balance font-display text-4xl font-bold leading-tight text-black lg:text-5xl">
            Shaping Knowledge Powering the Future.
          </h2>
          <div className="space-y-4 text-justify text-base font-light leading-relaxed text-[#1e1e1e]">
            <p>
              Founded on a rich history of academic excellence, Nnamdi Azikiwe University, Awka, stands at the
              forefront of e-learning innovation. Our university blends a legacy of knowledge with cutting-edge
              technology, creating a dynamic online learning environment.
            </p>
            <p>
              We are committed to providing accessible, flexible, and high-quality education to students worldwide.
              Whether you&apos;re pursuing a diploma, undergraduate degree, or professional certification, we equip
              you with the skills you need for success in a digital future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
