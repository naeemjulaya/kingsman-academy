import React from "react";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row relative bg-[#0A0A0A] overflow-hidden">
      {/* Glitch lines in background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="scanline" style={{ animationDelay: "0s" }}></div>
      </div>

      {/* Left Banner: 45% width */}
      <section className="hidden md:flex md:w-[45%] bg-[#1b1019] relative overflow-hidden items-center justify-center border-r border-primary/10">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-screen h-full" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXSQCt_5woHGCAsJdQEvgYJo33nWcL1_cTj519vOpggQXlL1EEGdcOn0NEPmvSKzBYJo_BtW1KUjtPS_NIP9Li-gnvbzfaFIRrDiPh5Jpv4RfF4TZDvRL9ZPyu_iOIeP2H6i8Mvl-4_TZqVbvfLWoyc3-CUJWtJULAAtAHpvlZ7PKjN_JpckYAUzdnpA_-p4ebdp0F7zvCaV0HGtxivaBjpOhWzUUoZykvA9W-8uAO2Ol6uZLwCfa7b9Q63v7bIcXHYBLnM-vDrsie')` }}></div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>
        
        <div className="relative z-10 px-10 text-center max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40">
              <span className="font-playfair text-[#FF48FF] font-bold text-xl">K</span>
            </div>
            <h1 className="font-playfair text-3xl text-primary font-bold tracking-widest">KINGSMAN</h1>
          </div>
          <p className="font-sans text-sm text-on-surface-variant max-w-xs mx-auto leading-relaxed">
            Prepare-se para entrar na elite acadêmica. O seu futuro de excelência começa com um único passo.
          </p>
          <div className="mt-8 flex justify-center gap-1.5">
            <div className="w-12 h-1.5 bg-primary/20 rounded-full"></div>
            <div className="w-12 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(255,72,255,0.5)]"></div>
            <div className="w-12 h-1.5 bg-primary/20 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Right Content Form Area: 55% width */}
      <section className="flex-1 min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo indicator */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8 text-center">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40">
              <span className="font-playfair text-[#FF48FF] font-bold text-md">K</span>
            </div>
            <h2 className="font-playfair text-xl text-primary font-bold tracking-widest">KINGSMAN</h2>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
};
