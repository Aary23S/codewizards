const founders = [
  { name: "Arya Satardekar", role: "Co-Founder", batch: 2026, domain: ["Web", "AI"] },
  { name: "Arya Dalal", role: "Co-Founder", batch: 2026, domain: ["Flutter", "Backend"] },
];

const faculty = [
  { name: "Mr. Sonak Saramke", role: "Faculty Coordinator" },
  { name: "Dr. Vidya Bhadade", role: "Faculty Coordinator" },
];

const PersonCard = ({ person }) => (
  <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 hover:border-gray-600 transition-colors">
    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg mb-4">
      {person.name.charAt(0)}
    </div>
    <p className="text-white font-semibold">{person.name}</p>
    <p className="text-gray-500 text-sm mt-1">{person.role}</p>
    {person.batch && <p className="text-gray-600 text-xs mt-1">Batch {person.batch}</p>}
    {person.domain && (
      <div className="flex flex-wrap gap-2 mt-3">
        {person.domain.map((d) => (
          <span key={d} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">{d}</span>
        ))}
      </div>
    )}
  </div>
);

const Team = () => (
  <div className="max-w-5xl mx-auto px-4 py-20">
    <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">The People</p>
    <h1 className="text-4xl font-bold text-white mb-12">Our Team</h1>

    <div className="mb-12">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Founders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {founders.map((f) => <PersonCard key={f.name} person={f} />)}
      </div>
    </div>

    <div>
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Faculty Coordinators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faculty.map((f) => <PersonCard key={f.name} person={f} />)}
      </div>
    </div>
  </div>
);

export default Team;