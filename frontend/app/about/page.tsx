"use client";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-10 bg-white min-h-screen">
      <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-10 inline-block">← Home</Link>
      
      <h1 className="text-5xl font-black text-gray-900 mb-8 uppercase tracking-tighter">About Product Explorer</h1>
      
      <div className="prose prose-slate lg:prose-xl text-gray-600 leading-relaxed">
        <p className="mb-6">
          This platform is a <strong>Production-Minded Exploration Tool</strong> built to showcase 
          real-time data synchronization with World of Books[cite: 4, 6].
        </p>

        <h2 className="text-2xl font-black text-gray-900 mt-10 mb-4 uppercase">Tech Stack [cite: 14, 33, 34]</h2>
        <ul className="list-disc pl-6 mb-10 space-y-2">
          <li><strong>Frontend:</strong> Next.js 14, TypeScript, Tailwind CSS[cite: 14].</li>
          <li><strong>Backend:</strong> NestJS with TypeORM[cite: 33].</li>
          <li><strong>Database:</strong> PostgreSQL for robust relational indexing.</li>
          <li><strong>Scraper:</strong> Crawlee + Playwright for ethical browser automation[cite: 45].</li>
        </ul>

        <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase">Architecture Decisions </h2>
        <p className="mb-6">
          The system utilizes an <strong>Asynchronous Scrape Job</strong> model to ensure the main 
          request thread is never blocked[cite: 79, 81]. Data is deduplicated using unique 
          constraints on Source IDs[cite: 41].
        </p>

        <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase">Contact</h2>
        <p>For technical inquiries, please refer to the GitHub Repository documentation[cite: 82].</p>
      </div>
    </div>
  );
}