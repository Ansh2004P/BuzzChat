import useSignupFunctionHook from "../hooks/Authentication/Signup/useSignupFunctionHook";
import useSignupVarHooks from "../hooks/Authentication/Signup/useSignupVarHooks";

const Signup = () => {
  const {
    navigate,
    name,
    email,
    password,
    errorMessage,
    setErrorMessage,
    avatar,
    previewAvatar,
    loading,
    setLoading,
    setPreviewAvatar,
  } = useSignupVarHooks();

  const { handleButtonClick, handleAvatarChange } = useSignupFunctionHook({
    name,
    email,
    password,
    setErrorMessage,
    avatar,
    previewAvatar,
    setPreviewAvatar,
    navigate,
    setLoading,
  });

  const onSubmitHandler = (e) => {
    e.preventDefault();
    handleButtonClick();
  };

  return (
    <div className="w-full h-full bg-stone-950 bg-opacity-95 absolute flex justify-center items-center text-white">
      <div className="p-6 my-10 w-[40%] min-w-[320px] h-fit bg-stone-800 bg-opacity-70 rounded-2xl flex flex-col justify-evenly backdrop-blur-lg shadow-lg shadow-black">
        <h1 className="text-3xl font-sans font-bold text-center">Sign-Up</h1>

        {/* Avatar Upload */}
        <div className="flex justify-center my-4">
          <label
            htmlFor="avatar-input"
            className="cursor-pointer relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-700"
          >
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-500 flex justify-center items-center">
                <img
                  src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                  alt="default avatar"
                  className="w-auto h-auto object-cover"
                />
              </div>
            )}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) =>
                e.target.files?.[0] && handleAvatarChange(e.target.files[0])
              }
            />
          </label>
        </div>

        {/* Signup Form */}
        <form onSubmit={onSubmitHandler} className="flex flex-col">
          <input
            ref={name}
            type="text"
            name="name"
            placeholder="Enter your name"
            className="p-4 my-3 w-full bg-gray-700 bg-opacity-50 rounded-md placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            ref={email}
            type="email"
            name="email"
            placeholder="Enter your email"
            className="p-4 my-3 w-full bg-gray-700 bg-opacity-50 rounded-md placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            ref={password}
            type="password"
            name="password"
            required
            placeholder="Enter your password"
            className="p-4 my-3 w-full bg-gray-700 bg-opacity-50 rounded-md placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 font-bold text-lg py-2">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`p-4 my-4 w-full rounded-lg cursor-pointer transition-all duration-200 ${
              loading
                ? "bg-emerald-900 cursor-not-allowed"
                : "bg-emerald-700 hover:bg-emerald-600"
            } text-white`}
          >
            {loading ? "Loading..." : "Sign-Up"}
          </button>
        </form>

        <div className="flex justify-center mt-2">
          <span>Have an account already?</span>
          <span
            className="ml-2 text-blue-500 hover:text-blue-400 underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log-in
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
