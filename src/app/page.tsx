import Image from "next/image";
import { LeadForm } from "@/components/LeadForm";

const Home = () => {
  return (
    <main className="flex flex-1 bg-zinc-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Image
          alt="DEBORIX"
          className="mb-10 h-auto w-[179px] sm:w-[215px]"
          height={122}
          src="/logo.png"
          width={358}
        />

        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Nuevo proyecto
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Cuéntanos qué quieres construir
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600 sm:text-lg">
            Comparte los datos principales de tu proyecto para que podamos conocer mejor tus
            necesidades.
          </p>
        </div>

        <LeadForm />
      </div>
    </main>
  );
};

export default Home;
