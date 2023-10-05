"use client";
import { useMemo, useReducer } from "react";
import { ABComparison } from "./ABComparison";
import styles from "./SortingView.module.css";

interface SortTarget {
  id: number;
  value: string;
  knownLarger: number[];
  knownSmaller: number[];
}

type Workset = { [key: number]: SortTarget };

interface SortResult {
  smaller: number;
  larger: number;
}

//Simple reducer; given a comparison result between two entries in the workset, updates the known larger and smaller values.
function reduceWorkSet(workset: Workset, result: SortResult) {
  const { smaller, larger } = result;
  var ret = propagateLarger(smaller, larger, workset);
  ret = propagateSmaller(smaller, larger, ret);
  console.log(ret);
  return ret;
}

/**
 * Propagates the known smaller value as a known "less than" value to every larger entry in the workset.
 * @param smaller id of the smaller entry
 * @param larger id of the larger entry
 * @param workset Workset to update
 * @returns An updated copy of the workset.
 */
function propagateSmaller(
  smaller: number,
  larger: number,
  workset: Workset
): Workset {
  if (smaller === larger) {
    console.warn("Loop detected");
    return workset;
  }
  const largerTarget = workset[larger];
  if (largerTarget.knownSmaller.findIndex((n) => n === smaller) >= 0) {
    return workset;
  }
  if (largerTarget.knownLarger.findIndex((n) => n === smaller) >= 0) {
    //The user has caused a loop, discard the previously know relationship and continue without propagating.
    return {
      ...workset,
      [larger]: {
        ...largerTarget,
        knownLarger: largerTarget.knownLarger.filter((n) => n !== smaller),
      },
    };
  }

  var ret = {
    ...workset,
    [larger]: {
      ...largerTarget,
      knownSmaller: [...largerTarget.knownSmaller, smaller],
    },
  };
  for (var i = 0; i < largerTarget.knownLarger.length; i++) {
    ret = propagateSmaller(smaller, largerTarget.knownLarger[i], ret);
  }

  return ret;
}

/**
 * Progapagates the "greater than" relation like propagateSmaller does.
 * @param smaller
 * @param larger
 * @param workset
 * @returns
 */
function propagateLarger(
  smaller: number,
  larger: number,
  workset: Workset
): Workset {
  if (smaller === larger) {
    console.warn("Loop detected");
    return workset;
  }
  const smallerTarget = workset[smaller];
  if (smallerTarget.knownLarger.findIndex((n) => n === larger) >= 0) {
    return workset;
  }
  if (smallerTarget.knownSmaller.findIndex((n) => n === larger) >= 0) {
    //The user has caused a loop, discard the previously know relationship and continue without propagating.
    return {
      ...workset,
      [smaller]: {
        ...smallerTarget,
        knownSmaller: smallerTarget.knownSmaller.filter((n) => n !== larger),
      },
    };
  }

  var ret = {
    ...workset,
    [smaller]: {
      ...smallerTarget,
      knownLarger: [...smallerTarget.knownLarger, larger],
    },
  };
  for (var i = 0; i < smallerTarget.knownSmaller.length; i++) {
    ret = propagateSmaller(smallerTarget.knownSmaller[i], larger, ret);
  }

  return ret;
}

/**
 *
 * @param target Constructs a workset out of a list of strings to compare.
 * @returns
 */
function toWorkSet(target: string[]): Workset {
  const asTargets: { [key: number]: SortTarget } = target.reduce(
    (res, cur, idx) => ({
      ...res,
      [idx]: { id: idx, value: cur, knownLarger: [], knownSmaller: [] },
    }),
    {} as { [key: number]: SortTarget }
  );
  return asTargets;
}

export default function SortingView(props: {
  target: string[];
  callback: (sorted: string[]) => void;
}) {
  const { target, callback } = props;
  const count = target.length;
  const [workset, dispatch] = useReducer(reduceWorkSet, target, toWorkSet);

  //Construct an order based on the known larged, i.e. largest first
  const currentOrder = useMemo(() => {
    const ordered = [];
    while (ordered.length < count) {
      ordered.push(undefined);
    }
    for (const k in workset) {
      const trg = workset[k];
      ordered[trg.knownLarger.length] = trg;
    }
    return ordered.filter((e) => e !== undefined);
  }, [workset]);

  const [a, b] = useMemo(() => {
    if (currentOrder.length === count) {
      return [-1, -2];
    }
    var aTemp = 0;
    var bTemp = 0;
    const start = Math.floor(Math.random() * count);

    const keys = Object.keys(workset).map((s) => Number.parseInt(s));
    var available = [];
    var idxA = start;
    do {
      idxA = (idxA + 1) % count;
      aTemp = keys[idxA];
      const known = new Set([
        ...workset[aTemp].knownSmaller,
        ...workset[aTemp].knownLarger,
      ]);
      available = keys.filter((i) => !known.has(i) && i !== aTemp);
    } while (available.length === 0 && idxA !== start);
    if (available.length === 0) {
      console.log("No available found");
      console.log(currentOrder);
      return [aTemp, bTemp];
    }
    console.log(available);
    const idxB = Math.floor(Math.random() * available.length);
    bTemp = available[idxB];
    const bTarget = workset[bTemp];
    if (bTarget.knownLarger.findIndex((i) => i === aTemp) >= 0) {
      dispatch({ smaller: bTemp, larger: aTemp });
    } else if (bTarget.knownSmaller.findIndex((i) => i === aTemp) >= 0) {
      dispatch({ larger: bTemp, smaller: aTemp });
    }
    return [aTemp, bTemp];
  }, [workset]);

  if (currentOrder.length === count) {
    callback(currentOrder.map((trg) => trg!.value));
    return (
      <ol className={styles.list}>
        {currentOrder.map((trg) => (
          <li key={trg?.id}>{trg?.value}</li>
        ))}
      </ol>
    );
  }
  console.log(`Next comparison; ${a} vs. ${b}`);
  return (
    <ABComparison
      a={workset[a].value}
      b={workset[b].value}
      callback={(aIsGreater) =>
        aIsGreater
          ? dispatch({ larger: a, smaller: b })
          : dispatch({ smaller: a, larger: b })
      }
    ></ABComparison>
  );
}
