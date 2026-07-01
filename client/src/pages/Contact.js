// const Contact = () => (
//   <div className="max-w-3xl mx-auto px-4 py-20">
//     <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Get In Touch</p>
//     <h1 className="text-4xl font-bold text-white mb-12">Contact</h1>

//     <div className="grid md:grid-cols-2 gap-8 mb-12">
//       <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
//         <h2 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Reach Us</h2>
//         <ul className="space-y-3 text-sm text-gray-400">
//           <li>📧 <a href="mailto:codewizards@dypatil.edu" className="hover:text-white transition-colors">codewizards@dypatil.edu</a></li>
//           <li>🏛️ D.Y. Patil Agriculture & Technical University, Talsande, Kolhapur</li>
//           <li>🏢 Department of Computer Science & Engineering</li>
//         </ul>
//       </div>

//       <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
//         <h2 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Follow Us</h2>
//         <ul className="space-y-3 text-sm">
//           <li>
//             <a href="https://github.com/codewizards" target="_blank" rel="noreferrer"
//               className="text-gray-400 hover:text-white transition-colors">
//               GitHub →
//             </a>
//           </li>
//           <li>
//             <a href="https://linkedin.com" target="_blank" rel="noreferrer"
//               className="text-gray-400 hover:text-white transition-colors">
//               LinkedIn →
//             </a>
//           </li>
//           <li>
//             <a href="https://instagram.com" target="_blank" rel="noreferrer"
//               className="text-gray-400 hover:text-white transition-colors">
//               Instagram →
//             </a>
//           </li>
//         </ul>
//       </div>
//     </div>

//     {/* Contact Form */}
//     <div className="border border-gray-800 rounded-xl p-8 bg-gray-900">
//       <h2 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Send a Message</h2>
//       <div className="flex flex-col gap-4">
//         <input
//           type="text"
//           placeholder="Your Name"
//           className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
//         />
//         <input
//           type="email"
//           placeholder="Your Email"
//           className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
//         />
//         <textarea
//           rows={4}
//           placeholder="Your message..."
//           className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none"
//         />
//         <button
//           className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm">
//           Send Message
//         </button>
//       </div>
//     </div>
//   </div>
// );

// export default Contact;

import { useEffect, useState } from "react";
import { getContact } from "../services/api";

const Contact = () => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getContact().then((res) => setInfo(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Get In Touch</p>
      <h1 className="text-4xl font-bold text-white mb-12">Contact</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Reach Us</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            {info?.email && <li>📧 <a href={`mailto:${info.email}`} className="hover:text-white transition-colors">{info.email}</a></li>}
            {info?.location && <li>🏛️ {info.location}</li>}
            {info?.department && <li>🏢 {info.department}</li>}
          </ul>
        </div>

        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
          <h2 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Follow Us</h2>
          <ul className="space-y-3 text-sm">
            {info?.github && <li><a href={info.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">GitHub →</a></li>}
            {info?.linkedin && <li><a href={info.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">LinkedIn →</a></li>}
            {info?.instagram && <li><a href={info.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Instagram →</a></li>}
            {info?.twitter && <li><a href={info.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Twitter →</a></li>}
          </ul>
        </div>
      </div>

      <div className="border border-gray-800 rounded-xl p-8 bg-gray-900">
        <h2 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Send a Message</h2>
        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Your Name" className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" />
          <input type="email" placeholder="Your Email" className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" />
          <textarea rows={4} placeholder="Your message..." className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm">Send Message</button>
        </div>
      </div>
    </div>
  );
};

export default Contact;