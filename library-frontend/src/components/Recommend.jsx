import { useQuery } from "@apollo/client";

import { ALL_BOOKS, ME } from "../queries";

const Recommend = (props) => {
  if (!props.show) {
    return null;
  }

  const books = useQuery(ALL_BOOKS);

  const currentUser = useQuery(ME);

  let userFavoriteGenre;
  
  if (currentUser.data) {
    userFavoriteGenre = currentUser.data.me.favoriteGenre;
  }

  if (books.loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>books</h2>

      <div>books in your favorite genre: {userFavoriteGenre}</div>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.data.allBooks.filter(book => book.genres.includes(userFavoriteGenre)).map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
