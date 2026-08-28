import { Link } from "@mui/material";

type LinkComponentProps = {
  text: string;
  link: string;
};

export const LinkComponent = ({ text, link }: LinkComponentProps) => {
  return (
    <li>
      <Link
        href={`#${link}`}
        className="landing-nav-link"
        underline="none"
        sx={{
          color: "black",
          "&:hover": {
            color: "var(--brand-gold-soft)",
          },
        }}
      >
        {text}
      </Link>
    </li>
  );
};
