const About = () => (
  <div className="max-w-4xl mx-auto px-4 py-20">
    <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Who We Are</p>
    <h1 className="text-4xl font-bold text-white mb-10">About CodeWizards</h1>

    <div className="grid md:grid-cols-2 gap-10 mb-16">
      <div>
        <h2 className="text-white font-semibold mb-3 uppercase text-xs tracking-widest">Mission</h2>
        <p className="text-gray-400 leading-relaxed">
          To build a strong technical community where every student — regardless of background —
          gets access to guidance, projects, and opportunities through peer mentorship and collaboration.
        </p>
      </div>
      <div>
        <h2 className="text-white font-semibold mb-3 uppercase text-xs tracking-widest">Vision</h2>
        <p className="text-gray-400 leading-relaxed">
          To make CodeWizards the most impactful student-led technical club in Maharashtra —
          one that produces developers, researchers, and innovators who give back to the community.
        </p>
      </div>
    </div>

    <div className="border border-gray-800 rounded-xl p-8 bg-gray-900 mb-10">
      <h2 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Founders</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { name: "Aary Satardekar", role: "Co-Founder", batch: "2022" },
          { name: "Aarya Dalal", role: "Co-Founder", batch: "2022" },
        ].map((f) => (
          <div key={f.name} className="border border-gray-700 rounded-lg p-5">
            <p className="text-white font-semibold">{f.name}</p>
            <p className="text-gray-500 text-sm mt-1">{f.role} · Batch {f.batch}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="border border-gray-800 rounded-xl p-8 bg-gray-900">
      <h2 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Faculty Coordinators</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { name: "Mr. Somnath Salunkhe", dept: "Computer Science & Engineering" },
          { name: "Dr. Vidya Baddadare", dept: "Computer Science & Engineering" },
        ].map((f) => (
          <div key={f.name} className="border border-gray-700 rounded-lg p-5">
            <p className="text-white font-semibold">{f.name}</p>
            <p className="text-gray-500 text-sm mt-1">{f.dept}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default About;