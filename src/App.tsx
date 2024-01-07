import Signin from "./pages/signin";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/home";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "./component/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<Signin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to={"/home"} />} />
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
