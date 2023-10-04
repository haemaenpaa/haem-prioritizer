"use client";
import dynamic from "next/dynamic";
import ListView from "../components/ListView";
import { createContext } from "vm";
const SortingView = dynamic(() => import("../components/SortingView"), {
  ssr: false,
});

const listContext = createContext([]);

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
