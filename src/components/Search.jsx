export const Search = ({ keyword, changeHandler, clickHandler }) => {
  return (
    <>
      <div className="inputBox">
        <input
          type="text"
          value={keyword}
          onChange={changeHandler}
          placeholder="Search for movies..."
        />
        <button onClick={clickHandler}>Search</button>
      </div>
    </>
  );
};
