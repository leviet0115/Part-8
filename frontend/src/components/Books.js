import { gql, useQuery } from "@apollo/client";

const Books = ({ books, show }) => {
  const { loading, error, data } = useQuery(
    ALL_BOOKS
    /*{ pollInterval: 2000 }*/
  );

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
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ALL_BOOKS = gql`
  query {
    allBooks {
      author
      published
      title
    }
  }
`;

export default Books;
