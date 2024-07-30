import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <div className="h-screen w-screen">
      <BrowserRouter>
        <div>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chats" element={<ChatPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
