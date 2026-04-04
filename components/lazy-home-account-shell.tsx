"use client";

import dynamic from "next/dynamic";

function HomeAccountShellSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[320px]">
      <div className="rounded-[28px] border border-border bg-gradient-to-br from-card to-secondary p-5 shadow-[0_14px_40px_rgba(143,95,89,0.1)]">
        <div className="h-3 w-20 rounded-full bg-muted" />
        <div className="mt-4 h-9 w-40 rounded-full bg-secondary" />
        <div className="mt-3 h-5 w-32 rounded-full bg-muted" />
        <div className="mt-5 h-12 rounded-full bg-background" />
      </div>
    </div>
  );
}

const HomeAccountShell = dynamic(
  () =>
    import("@/components/home-account-shell").then((module) => module.HomeAccountShell),
  {
    ssr: false,
    loading: () => <HomeAccountShellSkeleton />,
  },
);

export function LazyHomeAccountShell() {
  return <HomeAccountShell />;
}
