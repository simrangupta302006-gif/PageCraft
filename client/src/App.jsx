
import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Editor from "./Editor";
import PublicPortfolio from "./PublicPortfolio";
import Templates from "./Templates";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

     
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Route>

      <Route
        path="/portfolio/:slug"
        element={<PublicPortfolio />}
      />

      <Route path="/templates" element={<Templates />} />
    </Routes>
  );
}

export default App;
