const Rating = ({ value }) => {
  return (
    <div className="rating">
      <img
        src={value >= 1 ? "/star-solid.svg" : "/star-regular.svg"}
        width="20px"
        height="20px"
        alt="Star"
      />
      <img
        src={value >= 2 ? "/star-solid.svg" : "/star-regular.svg"}
        width="20px"
        height="20px"
        alt="Star"
      />
      <img
        src={value >= 3 ? "/star-solid.svg" : "/star-regular.svg"}
        width="20px"
        height="20px"
        alt="Star"
      />
      <img
        src={value >= 4 ? "/star-solid.svg" : "/star-regular.svg"}
        width="20px"
        height="20px"
        alt="Star"
      />
      <img
        src={value >= 5 ? "/star-solid.svg" : "/star-regular.svg"}
        width="20px"
        height="20px"
        alt="Star"
      />
    </div>
  );
};

export default Rating;
