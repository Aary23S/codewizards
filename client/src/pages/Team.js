// const founders = [
//   { name: "Arya Satardekar", role: "Co-Founder", batch: 2026, domain: ["Web", "AI"] },
//   { name: "Arya Dalal", role: "Co-Founder", batch: 2026, domain: ["Flutter", "Backend"] },
// ];

// const faculty = [
//   { name: "Mr. Sonak Saramke", role: "Faculty Coordinator" },
//   { name: "Dr. Vidya Bhadade", role: "Faculty Coordinator" },
// ];

// const PersonCard = ({ person }) => (
//   <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 hover:border-gray-600 transition-colors">
//     <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg mb-4">
//       {person.name.charAt(0)}
//     </div>
//     <p className="text-white font-semibold">{person.name}</p>
//     <p className="text-gray-500 text-sm mt-1">{person.role}</p>
//     {person.batch && <p className="text-gray-600 text-xs mt-1">Batch {person.batch}</p>}
//     {person.domain && (
//       <div className="flex flex-wrap gap-2 mt-3">
//         {person.domain.map((d) => (
//           <span key={d} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">{d}</span>
//         ))}
//       </div>
//     )}
//   </div>
// );

// const Team = () => (
//   <div className="max-w-5xl mx-auto px-4 py-20">
//     <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">The People</p>
//     <h1 className="text-4xl font-bold text-white mb-12">Our Team</h1>

//     <div className="mb-12">
//       <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Founders</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {founders.map((f) => <PersonCard key={f.name} person={f} />)}
//       </div>
//     </div>

//     <div>
//       <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Faculty Coordinators</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {faculty.map((f) => <PersonCard key={f.name} person={f} />)}
//       </div>
//     </div>
//   </div>
// );

// export default Team;

import { useEffect, useState } from "react";
import { getTeam } from "../services/api";

const PersonCard = ({ person }) => (
  <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 hover:border-gray-600 transition-colors">
    {person.imageUrl ? (
      <img src={person.imageUrl} alt={person.name}
        className="w-12 h-12 rounded-full object-cover mb-4" />
    ) : (
      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg mb-4">
        {person.name.charAt(0)}
      </div>
    )}
    <p className="text-white font-semibold">{person.name}</p>
    <p className="text-gray-500 text-sm mt-1">{person.role}</p>
    {person.batch && <p className="text-gray-600 text-xs mt-1">Batch {person.batch}</p>}
    {person.domain?.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {person.domain.map((d) => (
          <span key={d} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">{d}</span>
        ))}
      </div>
    )}
    <div className="flex gap-3 mt-3">
      {person.github && <a href={person.github} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">GitHub →</a>}
      {person.linkedin && <a href={person.linkedin} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">LinkedIn →</a>}
    </div>
  </div>
);

const CATEGORIES = [
  { key: "founder", label: "Founders" },
  { key: "faculty", label: "Faculty Coordinators" },
  { key: "core", label: "Core Team" },
  { key: "mentor", label: "Mentors" },
];

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeam()
      .then((res) => setMembers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">The People</p>
      <h1 className="text-4xl font-bold text-white mb-12">Our Team</h1>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : (
        CATEGORIES.map(({ key, label }) => {
          const group = members.filter((m) => m.category === key);
          if (group.length === 0) return null;
          return (
            <div key={key} className="mb-12">
              <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-6">{label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.map((m) => <PersonCard key={m._id} person={m} />)}
              </div>
            </div>
          );
        })
      )}

      {!loading && members.length === 0 && (
        <p className="text-gray-600 text-sm">Team info coming soon.</p>
      )}
    </div>
  );
};

export default Team;