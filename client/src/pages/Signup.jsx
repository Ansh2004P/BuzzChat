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
    setAvatar,
    previewAvatar,
    setPreviewAvatar,
    loading,
    setLoading,
  } = useSignupVarHooks();

  const { handleButtonClick, handleAvatarChange } = useSignupFunctionHook({
    name,
    email,
    password,
    setErrorMessage,
    setAvatar,
    setPreviewAvatar,
    navigate,
    setLoading,
  });

  return (
    <div className="w-full h-full bg-stone-950 bg-opacity-95 absolute flex justify-center items-center text-white">
      <div className="p-4 my-10 w-[40%] h-fit bg-stone-800 bg-opacity-70 rounded-2xl flex flex-col justify-evenly backdrop-blur-lg shadow-lg shadow-black">
        <h1 className="text-3xl font-sans font-bold text-center">Sign-Up</h1>
        <div className="flex justify-center my-4 ">
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
                  alt="default image"
                />
              </div>
            )}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleAvatarChange(e.target.files[0])}
            />
          </label>
        </div>

        <form onClick={(e) => e.preventDefault()}>
          <input
            ref={name}
            type="text"
            placeholder="Enter your name"
            className="p-4 my-4 w-full bg-gray-700 bg-opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            ref={email}
            type="text"
            placeholder="Enter your email"
            className="p-4 my-4 w-full bg-gray-700 bg-opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            required={true}
            ref={password}
            type="password"
            placeholder="Enter your Password"
            className="p-4 my-4 w-full bg-gray-700 bg-opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <p className="text-red-500 font-bold text-lg py-2">{errorMessage}</p>
          <button
            onClick={handleButtonClick}
            disabled={loading}
            className="p-4 my-4 bg-emerald-700 text-white w-full rounded-lg cursor-pointer"
          >
            {loading ? "Loading..." : "Sign-Up"}
          </button>
        </form>
        <div className="flex">
          <span>Have account already? </span>
          <span
            className="mx-1 text-blue-600 underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            log-in
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
