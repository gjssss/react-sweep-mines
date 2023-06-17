"use client";

import { BoomGame } from "./BoomGame";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <BoomGame width={5} height={5} size={50} />
    </main>
  );
}
