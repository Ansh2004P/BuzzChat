import { Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import { AuthProvider } from "./context/AuthContext";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import appStore from "./utils/redux/appStore";
import ToastNotification from "./components/ToastNotification";

function App() {
  return (
    <Provider store={appStore}>
      {/* <AuthProvider> */}
        <ToastNotification />
        <div className="h-screen w-screen">
          <div>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/chats" element={<ChatPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </div>
        </div>
      {/* </AuthProvider> */}
    </Provider>
  );
}

export default App;
