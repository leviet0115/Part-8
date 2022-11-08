import { useQuery } from "@apollo/client";
import { ALL_AUTHORS } from "../query";
import AuthorEditor from "./AuthorEditor";

const Authors = ({ show }) => {
  const { loading, error, data } = useQuery(
    ALL_AUTHORS
    /*{pollInterval: 2000}*/
  );
  //const authors = data.allAuthors;
  //console.log(authors);

  if (!show) {
    return null;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <AuthorEditor authors={data} />
    </div>
  );
};

export default Authors;
