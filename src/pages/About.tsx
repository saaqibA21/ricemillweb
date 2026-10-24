// src/pages/About.tsx
import { Leaf, Award, Users, Factory } from 'lucide-react';

const milestones = [
  { year: '1981', event: 'Hariharan Traders founded in Tamil Nadu' },
  { year: '1995', event: 'Expanded to 50,000 sq ft modern milling facility' },
  { year: '2003', event: 'Achieved FSSAI and ISO 9001 certification' },
  { year: '2010', event: 'First export to Middle East markets' },
  { year: '2016', event: 'ISO 22000:2018 food safety management certification' },
  { year: '2020', event: 'Online store launched — direct to consumer' },
  { year: '2024', event: 'Supplying to 25+ countries, 50,000+ families served' },
];

export default function About() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="section-subtitle">Our Story</p>
          <h1 className="section-title mb-4 text-[#1c1917]">38 Years of Pure Grain</h1>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-stone-700 max-w-3xl mx-auto text-lg leading-relaxed font-medium">
            What started as a small family-run rice mill in Tamil Nadu has grown into one of 
            South India's most trusted rice processing and wholesale brands — without ever compromising on the 
            one thing that matters most: <span className="text-[#b7860e] font-bold">quality you can taste.</span>
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { Icon: Leaf, title: 'Farm First', desc: 'We source paddy direct from local growers for traceable, pure quality.' },
            { Icon: Factory, title: 'Modern Milling', desc: 'State-of-the-art sortex, optical graders, and gravity separators for zero-defect grains.' },
            { Icon: Award, title: 'Certified Quality', desc: 'FSSAI, ISO 22000, and quality certifications on every shipment.' },
            { Icon: Users, title: 'Community', desc: 'Supporting farming families and thousands of retail customers across India.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="card p-6 bg-white shadow-sm">
              <div className="w-12 h-12 bg-[#fefce8] border border-[#fde68a] rounded-2xl flex items-center justify-center mb-4 text-[#b7860e]">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-[#1c1917] text-lg mb-2">{title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="font-serif text-3xl font-bold text-[#1c1917] text-center mb-12">Our Journey</h2>
          <div className="relative">
            {/* Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#d4a017] to-stone-300" />

            <div className="space-y-8">
              {milestones.map(({ year, event }) => (
                <div key={year} className="flex gap-6 pl-8 relative">
                  <div className="absolute left-0 top-1.5 w-4 h-4 bg-[#d4a017] rounded-full border-2 border-white shadow-sm" />
                  <div className="shrink-0">
                    <span className="text-[#b7860e] font-bold font-mono text-lg">{year}</span>
                  </div>
                  <div className="card px-5 py-3 flex-1 bg-white shadow-sm">
                    <p className="text-stone-700">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Process */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-bold text-[#1c1917] mb-4">Farm to Table Process</h2>
          <div className="gold-divider mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { step: '01', title: 'Paddy Sourcing', desc: 'Direct from our farms & partner growers' },
            { step: '02', title: 'Drying & Cleaning', desc: 'Sun-dried and machine-cleaned' },
            { step: '03', title: 'Milling & Sorting', desc: 'Optical sortex, zero breakage' },
            { step: '04', title: 'Packing & Dispatch', desc: 'Hermetically sealed, labelled, shipped' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="card p-5 text-center bg-white shadow-sm">
              <div className="font-serif text-4xl font-bold text-[#d4a017]/40 mb-2">{step}</div>
              <h3 className="text-[#1c1917] font-bold mb-1">{title}</h3>
              <p className="text-stone-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
