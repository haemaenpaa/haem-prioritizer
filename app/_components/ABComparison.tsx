"use client";
import styles from "./ABComparison.module.css";
export function ABComparison(props: {
  a: string;
  b: string;
  callback: (aIsGreater: boolean) => void;
}) {
  const { a, b, callback } = props;
  return (
    <div className={styles["comparison"]}>
      <button className={styles["left"]} onClick={() => callback(true)}>
        {a}
      </button>
      <button className={styles["right"]} onClick={() => callback(false)}>
        {b}
      </button>
    </div>
  );
}
