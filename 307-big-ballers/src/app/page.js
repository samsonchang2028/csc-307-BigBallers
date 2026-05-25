"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <div className="flex justify-between">
        <h1>OptiCart</h1>
        <div>
          <button onClick={() => router.push("/login")}>Login</button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <h1>Buy smarter</h1>
        <p> hdajfoisdfs</p>
        <button onClick={() => router.push("/home")}>Search now!</button>
      </div>
      <div>bot</div>
    </main>
  );
}
