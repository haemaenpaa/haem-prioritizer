"use client";
import dynamic from "next/dynamic";
const SortingView = dynamic(() => import("./_components/SortingView"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex">
      <SortingView
        target={["first", "second", "third", "fourth", "fifth"]}
        callback={() => alert("Done")}
      ></SortingView>
    </main>
  );
}
