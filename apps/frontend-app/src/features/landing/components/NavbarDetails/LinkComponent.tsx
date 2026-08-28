import Link from "next/link";
import styles from "./LinkComponent.module.css";
import { FaLongArrowAltLeft } from "react-icons/fa";

interface LinkComponentProps {
  text: string;
  link: string;
}

export const LinkComponent = ({ text, link }: LinkComponentProps) => {
  return (
    <Link href={link} className={styles.link}>
      <FaLongArrowAltLeft />
      {text}
    </Link>
  );
};
