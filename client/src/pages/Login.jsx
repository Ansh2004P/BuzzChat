/* eslint-disable react/no-unescaped-entities */
import useLoginVarHook from "../hooks/Authentication/Login/useLoginVarHook";
import useLoginFunctionHook from "../hooks/Authentication/Login/useLoginFunctionHook";

const Login = () => {
  const {
    navigate,
    name,
    email,
    password,
    errorMessage,
    setErrorMessage,
    loading,
    setLoading,
    dispatch,
  } = useLoginVarHook();

  const { handleButtonClick } = useLoginFunctionHook({
    navigate,
    name,
    email,
    password,
    errorMessage,
    setErrorMessage,
    loading,
    setLoading,
    dispatch,
  });

  return (
    <div className="w-full h-full bg-stone-950 bg-opacity-95 absolute flex justify-center text-white">
      <div className="p-4 my-10 w-[40%] h-fit bg-stone-800 bg-opacity-70 rounded-2xl flex flex-col justify-evenly backdrop-blur-lg shadow-lg shadow-black">
        <h1 className="text-3xl font-sans font-bold mx-[40%]">Login</h1>
        <form className="mt-6" onClick={(e) => e.preventDefault()}>
          <input
            ref={name}
            type="text"
            placeholder="Enter your name"
            className="p-4 my-4 w-full bg-gray-700 opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            ref={email}
            type="text"
            placeholder="Enter your email"
            className="p-4 my-4 w-full bg-gray-700 opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            required={true}
            ref={password}
            type="password"
            placeholder="Enter your Password"
            className="p-4 my-4 w-full bg-gray-700 opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <p className="text-red-500 font-bold text-lg py-2">{errorMessage}</p>
          <button
            onClick={handleButtonClick}
            disabled={loading}
            className="p-4 my-4 bg-emerald-700 text-white w-full rounded-lg cursor-pointer"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        <div className="flex">
          <span>Don't have account? </span>
          <span
            className="mx-1 text-blue-600 underline cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            create a account
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
