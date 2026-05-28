"use client";
import React from "react";
import ErrorPage from "./error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-[#0e0a08] text-[#f5e8d5]">
        <ErrorPage error={error} reset={reset} />
      </body>
    </html>
  );
}
