import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";

import { ALL_AUTHORS, EDIT_YEAR } from '../queries';

const Authors = (props) => {
  if (!props.show) {
    return null;
  }

  const [name, setName] = useState("");
  const [year, setYear] = useState("");

  const authors = useQuery(ALL_AUTHORS);

  const [changeYear] = useMutation(EDIT_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const editYear = (event) => {
    event.preventDefault();

    changeYear({ variables: { name, setBornTo: Number(year) } });

    setName("");
    setYear("");
  };

  if (authors.loading) {
    return <div>loading...</div>;
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
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={editYear}>
        
        <select value={name} onChange={({ target }) => setName(target.value)}>
          {authors.data.allAuthors.map((author) => (
            <option key={author.name} value={author.name}>
              {author.name}
            </option>
          ))}
        </select>

        <div>
          born
          <input
            type="number"
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
