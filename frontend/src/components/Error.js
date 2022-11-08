const Error = ({ msg, show }) => {
  const style = {
    color: "red",
    display: show ? "block" : "none",
  };

  return <p style={{ style }}>{msg}</p>;
};

export default Error;
