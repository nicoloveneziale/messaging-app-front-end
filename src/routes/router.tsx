import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Root from "./Root";
import Login from "../pages/Login";
//import Register from "../pages/Register";
//import Chat from "../pages/Chat";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />,
      <Route path="/register"/>,
      <Route path="/" element={<Root />}>
        <Route path="/chat"/>
      </Route>
    </>
  )
);

export default router;