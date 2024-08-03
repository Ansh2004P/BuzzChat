import Loading from "../assets/images/Ellipsis@1x-1.8s-200px-200px.jsx";

const Loader = () => {
  // Prevent the animation from pausing when clicked
  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black bg-opacity-65">
      <div onClick={handleClick}>
        <Loading />
      </div>
    </div>
  );
};

export default Loader;
