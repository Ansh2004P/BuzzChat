// a utility of cross button
import PropTypes from "prop-types";

export const CrossButton = ({ onClick }) => {
  return (
    <button
      className="absolute top-4 right-4 text-white hover:text-gray-500"
      onClick={onClick}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

CrossButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
