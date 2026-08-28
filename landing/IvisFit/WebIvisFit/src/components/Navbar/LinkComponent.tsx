import { Link } from "@mui/material";

type LinkComponentProps = {
  text: string;
  link: string;
};

export const LinkComponent = ({text, link}: LinkComponentProps)=> {
  return (
    <Link
      href={`#${link}`}
      sx={{
        position: "relative",
        textDecoration: "none",
        fontSize: "1.2rem",
        color: "black",
        "&:hover": {
          color: "#FDC915",
          "&::after": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "2px",
            bottom: "-4px",
            left: "0",
            backgroundColor: "#FDC915",
            transform: "scaleX(1)",
            transition: "transform 0.3s ease",
          },
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "2px",
          bottom: "-4px",
          left: "0",
          backgroundColor: "#FDC915",
          transform: "scaleX(0)",
          transformOrigin: "center",
          transition: "transform 0.3s ease",
        },
      }}
    >
        {
        text
        }
    </Link>
  );
};
