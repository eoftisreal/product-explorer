"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Define strict types for Product
interface Product {
  id: number;
  title: string;
  price: string;
  image: string;
  category: string;
  rating: number;
  author?: string;
  description?: string;
}

// Interface for History API response
interface HistoryItem {
  id: number;
  product: Product;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Home() {
  const [books, setBooks] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [history, setHistory] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);

  const renderStars = (rating: number) => {
    const filled = Math.floor(rating || 0);
    return (
      <div className="flex text-yellow-400 text-xs">
        {'★'.repeat(filled)}
        <span className="text-gray-200">{'★'.repeat(5 - filled)}</span>
        <span className="ml-1 text-gray-400">({rating})</span>
      </div>
    );
  };

  const triggerScrape = async () => {
    setIsScraping(true);
    setScrapeMessage("Sync started... this may take a few minutes.");

    const targets = [
      { name: "Fiction", url: "https://www.worldofbooks.com/en-gb/collections/fiction-books" },
      { name: "Non-Fiction", url: "https://www.worldofbooks.com/en-gb/collections/non-fiction-books" }
    ];

    try {
      for (const t of targets) {
        await fetch(`${API_BASE_URL}/products/scrape`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryName: t.name, url: t.url }),
        });
      }
      setTimeout(() => {
        setIsScraping(false);
        setScrapeMessage("Sync initiated in background!");
        setTimeout(() => setScrapeMessage(null), 3000);
      }, 2000);
    } catch (err) {
      console.error(err);
      setScrapeMessage("Sync failed to start.");
      setIsScraping(false);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(["All", ...data]))
      .catch(console.error);

    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      fetch(`${API_BASE_URL}/products/history/${sessionId}`)
        .then(res => res.ok ? res.json() : [])
        .then((data: HistoryItem[]) => {
          const allBooks = data.map(item => item.product);
          // Deduplicate history
          const unique = allBooks.filter((b, i, s) => i === s.findIndex(t => t?.id === b?.id));
          setHistory(unique);
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // We only set loading if we are about to fetch new data
    // to avoid layout shifts or unnecessary re-renders.
    // setLoading(true); // RE-ENABLE THIS IF NEEDED, BUT BEWARE OF LINT ERRORS

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "12",
      category: selectedCategory,
      search: searchQuery
    });

    // Start fetch
    fetch(`${API_BASE_URL}/products?${params.toString()}`)
      .then(res => res.json())
      .then(response => {
        if (isMounted) {
          setBooks(response.data || []);
          setTotalPages(response.lastPage || 1);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen p-8 bg-white text-black">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Book Explorer</h1>
          <div className="flex flex-col items-end">
            <button
              onClick={triggerScrape}
              disabled={isScraping}
              className={`px-8 py-3 rounded-full font-bold text-white shadow-xl ${isScraping ? "bg-gray-400" : "bg-red-600 hover:scale-105 transition-transform"}`}
            >
              {isScraping ? "🔄 Syncing..." : "🚀 Refresh Data"}
            </button>
            {scrapeMessage && <span className="text-xs text-gray-500 mt-2 font-bold">{scrapeMessage}</span>}
          </div>
        </header>
        
        <div className="mb-10">
          <input
            type="text" placeholder="Search titles or authors..."
            className="w-full p-4 border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); setLoading(true); }}
          />
        </div>

        {history.length > 0 && (
          <div className="mb-16 bg-blue-50/30 p-8 rounded-3xl border border-blue-50">
            <h3 className="font-black text-blue-900 mb-6 text-xs tracking-widest uppercase">Recently Viewed</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {history.map((book: Product) => (
                <Link href={`/products/${book.id}`} key={`hist-${book.id}`} className="w-36 flex-shrink-0 group">
                  <div className="bg-white p-3 h-48 rounded-2xl shadow-sm group-hover:shadow-md transition-all flex items-center justify-center border border-blue-100 relative">
                    {/* Using unoptimized images because they are external URLs */}
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <p className="text-[10px] font-bold mt-3 truncate text-gray-500 uppercase">{book.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-10 flex-wrap">
          {categories.map((cat: string) => (
            <button
                key={cat}
                onClick={() => {setSelectedCategory(cat); setPage(1); setLoading(true);}}
                className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${selectedCategory === cat ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
            <div className="text-center py-40 animate-pulse text-gray-300 font-bold">LOADING...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {books.map((book: Product) => (
                <Link href={`/products/${book.id}`} key={book.id} className="group bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative">
                  <div className="absolute top-5 left-5 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {book.category}
                  </div>
                  <div className="h-64 bg-gray-50 flex items-center justify-center p-10 group-hover:bg-white transition-colors relative">
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      className="object-contain p-8 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h2 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 h-14 mb-2">{book.title}</h2>
                    <div className="mb-4">{renderStars(book.rating)}</div>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-2xl font-black text-blue-600">{book.price}</span>
                      <div className="bg-gray-900 text-white p-3 rounded-2xl group-hover:bg-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center items-center gap-10 mt-20">
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); setLoading(true); }}
                disabled={page === 1}
                className="font-black text-[10px] uppercase tracking-widest disabled:opacity-20"
              >
                  ← Prev
              </button>
              <span className="font-black text-sm">PAGE {page} / {totalPages}</span>
              <button
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); setLoading(true); }}
                disabled={page === totalPages}
                className="font-black text-[10px] uppercase tracking-widest disabled:opacity-20"
              >
                  Next →
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
