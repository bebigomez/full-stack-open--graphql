import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { ALL_BOOKS } from "../queries";

const Books = ({ show, books }) => {
  
  if (!show) {
    return null;
  }

  const [booksList, setBooksList] = useState(books);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  
  const { loading, data } = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
    skip: !selectedGenre,
  });

  useEffect(() => {
    let genresSet = new Set();
    books.forEach((book) => {
      book.genres.forEach((genre) => genresSet.add(genre));
    });

    setGenres([...genresSet]);
  }, [books]);

  useEffect(() => {
    if (!selectedGenre) {
      setBooksList(books);
    } else {
      if (!loading && data) {
        setBooksList(data.allBooks);
      }
    }
  }, [books, selectedGenre, data]);

  const handleShowAll = () => {
    setSelectedGenre(null);
  };

  return (
    <div>
      <h2>Books</h2>
      {selectedGenre && <p>in genres {selectedGenre}</p>}
      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {booksList.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => {
            setSelectedGenre(genre);
          }}
          disabled={selectedGenre === genre}
        >
          {genre}
        </button>
      ))}
      {selectedGenre && <button onClick={handleShowAll}>Show All</button>}
    </div>
  );
};

export default Books;
