import { useMutation } from "@apollo/client";
import { useState } from "react";
import { EDIT_AUTHOR } from "../mutation";
import { ALL_AUTHORS } from "../query";

const AuthorEditor = () => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const editedAuthor = editAuthor({
      variables: { name, setBornTo: Number(born) },
    });
    console.log(editedAuthor);
  };

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={handleSubmit}>
        <p>
          name: <input value={name} onChange={(e) => setName(e.target.value)} />
        </p>
        <p>
          born:{" "}
          <input
            type="number"
            value={born}
            onChange={(e) => setBorn(e.target.value)}
          />
        </p>
        <input type="submit" />
      </form>
    </div>
  );
};

export default AuthorEditor;
