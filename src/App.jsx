import { MovieBox } from "./components/MovieBox";

const App = () => {
  return (
    <>
      <div className="container">
        {/* <p>{number}</p> */}
        <h1>MoviePedia</h1>
        <p>
        Explore a vast cinematic universe with our user-friendly movie search website. Discover, rate, and find your favorite films effortlessly.
        </p>
        <MovieBox />
      </div>
    </>
  );
};

export default App;
