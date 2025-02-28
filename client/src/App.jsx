import { Route, Routes, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Provider, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import appStore, { persistor } from "./utils/redux/appStore";
import ToastNotification from "./components/ToastNotification";
import { PersistGate } from "redux-persist/integration/react";

function AppContent() {
  const selector = useSelector((state) => state.user.user);
  const userInfo = selector._id === "" ? null : selector;
  return (
    <>
      <ToastNotification />
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/chats"
            element={userInfo ? <ChatPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={userInfo ? <Navigate to="/chats" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={userInfo ? <Navigate to="/chats" replace /> : <Signup />}
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Provider store={appStore}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;
