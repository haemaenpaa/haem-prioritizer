import styles from "./ListView.module.css";

export default function ListView(props: {
  values: string[];
  ordered?: boolean;
  onDelete?: (index: number) => void;
}) {
  const { values, ordered, onDelete } = props;

  const listItems = values.map((value, index) => (
    <li key={index} className={styles.listItem}>
      {value}
      {onDelete ? (
        <button className={styles.deleteButton} onClick={() => onDelete(index)}>
          X
        </button>
      ) : (
        <></>
      )}
    </li>
  ));

  if (ordered) {
    return <ol className={styles.list}>{listItems}</ol>;
  } else {
    return <ul className={styles.list}>{listItems}</ul>;
  }
}
