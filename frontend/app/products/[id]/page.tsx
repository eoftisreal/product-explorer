"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Define Types
interface Product {
  id: number;
  title: string;
  price: string;
  image: string;
  category: string;
  author?: string;
  description?: string;
  sourceUrl: string;
  sourceId: string;
  lastScrapedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;

    // 1. Fetch Main Product
    fetch(`${API_BASE_URL}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        
        // Persist history
        let sessionId = localStorage.getItem("session_id");
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(2, 11);
          localStorage.setItem("session_id", sessionId);
        }
        
        fetch(`${API_BASE_URL}/products/${id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        }).catch(console.error);
      })
      .catch(console.error);

    // 2. Fetch Related Products
    fetch(`${API_BASE_URL}/products/${id}/related`)
      .then(res => res.json())
      .then(data => setRelated(data))
      .catch(err => console.error("Failed to load related books", err));

  }, [id]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-3xl font-black text-gray-200 uppercase">Loading...</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white min-h-screen text-black">
      <Link href="/" className="inline-block mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">← Back to Explorer</Link>
      
      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start mb-24">
        <div className="bg-gray-50 rounded-[48px] p-12 flex items-center justify-center aspect-[4/5] overflow-hidden shadow-inner border border-gray-100 relative">
          <Image
            src={product.image} 
            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 p-8"
            alt={product.title}
            fill
            unoptimized
          />
        </div>

        <div>
          <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase mb-6 tracking-widest">
            {product.category}
          </span>
          <h1 className="text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tighter uppercase">
            {product.title}
          </h1>
          <p className="text-xl text-gray-400 font-bold mb-8">by {product.author || 'Unknown Author'}</p>
          
          <div className="mb-10 text-gray-600 leading-relaxed text-sm border-l-4 border-blue-50 pl-6">
            {product.description || "Full description being synced..."}
          </div>

          <div className="flex items-center gap-6 mb-10">
            <span className="text-5xl font-black text-blue-600">{product.price}</span>
            <a 
              href={product.sourceUrl} 
              target="_blank" 
              className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95"
            >
              Buy on World of Books
            </a>
          </div>

          <div className="pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase">ISBN</p>
              <p className="text-xs font-bold text-gray-600">{product.sourceId}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase">Last Updated</p>
              <p className="text-xs font-bold text-gray-600">{new Date(product.lastScrapedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Books Section */}
      {related.length > 0 && (
        <div className="border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-black text-gray-900 mb-10 uppercase tracking-tighter">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {related.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="group">
                <div className="bg-gray-50 rounded-3xl p-6 mb-4 aspect-[2/3] flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 relative">
                  <Image
                    src={item.image} 
                    alt={item.title}
                    className="object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 p-4"
                    fill
                    unoptimized
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 font-bold">{item.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
