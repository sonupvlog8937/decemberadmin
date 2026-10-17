import React, { useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";
import "../../Components/ui-theme.css";

const SearchBox = (props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInput = useRef();

  const onChangeInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    props.setSearchQuery(value);
    if (value === "") {
      props.setPageOrder?.(1);
    }
  };

  const clear = () => {
    setSearchQuery("");
    props.setSearchQuery("");
    props.setPageOrder?.(1);
    searchInput.current?.focus();
  };

  return (
    <div className="sb-wrap dx">
      <IoSearch className="sb-icon" />
      <input
        type="text"
        className="sb-input"
        placeholder="Search here..."
        value={searchQuery}
        ref={searchInput}
        onChange={onChangeInput}
      />
      <button
        type="button"
        className={`sb-clear${searchQuery ? " show" : ""}`}
        onClick={clear}
        aria-label="Clear search"
        tabIndex={searchQuery ? 0 : -1}
      >
        ✕
      </button>
    </div>
  );
};

export default SearchBox;