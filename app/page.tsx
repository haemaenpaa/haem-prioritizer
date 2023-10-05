"use client";
import ListView from "@/components/ListView";
import dynamic from "next/dynamic";
import { useState } from "react";
const SortingView = dynamic(() => import("../components/SortingView"), {
  ssr: false,
});

function SortPage(props: {
  list: string[];
  onSorted: (list: string[]) => void;
}) {
  const { list, onSorted } = props;

  return (
    <>
      <SortingView target={list} callback={onSorted}></SortingView>
    </>
  );
}

function InputPage(props: {
  initial: string[];
  callback: (l: string[]) => void;
}) {
  const { initial, callback } = props;
  const [list, setList] = useState(initial);
  return (
    <div>
      <ListView
        values={list}
        onDelete={(i) => {
          setList(list.filter((_, j) => i != j));
        }}
      ></ListView>
      <input
        type="text"
        placeholder="Add to list"
        onBlur={(ev) => {
          if (ev.target.value.trim().length === 0) return;
          setList([...list, ev.target.value]);
          ev.target.value = "";
        }}
      ></input>
      <button onClick={() => callback(list)}>Done</button>
    </div>
  );
}

function Switch(props: {
  mode: string;
  list: string[];
  setList: (list: string[]) => void;
  setMode: (m: string) => void;
}) {
  const { mode, list, setList, setMode } = props;
  switch (mode) {
    case "input":
      return (
        <InputPage
          initial={list}
          callback={(l) => {
            setList(l);
            setMode("sort");
          }}
        ></InputPage>
      );
    case "sort":
      return (
        <SortPage
          list={list}
          onSorted={(s: string[]) => {
            setList(s);
            setMode("view");
          }}
        ></SortPage>
      );
    case "view":
      return <ListView values={list} ordered={true}></ListView>;
    default:
      return <h1>No such mode {mode}</h1>;
  }
}

export default function Home() {
  const [list, setList] = useState<string[]>([]);
  const [mode, setMode] = useState("input");
  return (
    <main className="flex">
      <Switch
        mode={mode}
        list={list}
        setMode={setMode}
        setList={setList}
      ></Switch>
    </main>
  );
}
