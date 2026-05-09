// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";

// export default function HomePage() {
//   const router = useRouter();

//   useEffect(() => {
//     // If already logged in → go to dashboard
//     async function checkUser() {
//       const { data } = await supabase.auth.getUser();
//       if (data.user) {
//         router.replace("/dashboard");
//       }
//     }
//     checkUser();
//   }, []);

//   return (
//     <main className="min-h-screen flex flex-col items-center justify-center gap-6">
//       <h1 className="text-3xl font-bold">🛒 Opticart</h1>
//       <p className="text-gray-600">
//         Compare grocery prices and save money.
//       </p>

//       <div className="flex gap-4">
//         <button
//           onClick={() => router.push("/login")}
//           className="bg-black text-white px-4 py-2 rounded">
//           Login
//         </button>

//         <button
//           onClick={() => router.push("/signup")}
//           className="border px-4 py-2 rounded">
//           Sign Up
//         </button>
//       </div>
//     </main>
//   );
// }

"use client";

import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function HomePage() {
  return <div>Hello</div>;
}
