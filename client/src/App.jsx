import { Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import appStore from "./utils/redux/appStore";
import ToastNotification from "./components/ToastNotification";
import RedirectIfAuthenticated from "./Routes/RedirectRoute/RedirectRoute";
import ProtectedRoute from "./Routes/protectedRoutes/ProtectedRoute";
import { useEffect } from "react";
import useInitHook from "./hooks/useInitHook";

function App() {
  useInitHook();
  return (
    <Provider store={appStore}>
      {/* <AuthProvider> */}
      <ToastNotification />
      <div className="h-screen w-screen">
        <div>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <Login />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/signup"
              element={
                <RedirectIfAuthenticated>
                  <Signup />
                </RedirectIfAuthenticated>
              }
            />
          </Routes>
        </div>
      </div>
      {/* </AuthProvider> */}
    </Provider>
  );
}

export default App;
