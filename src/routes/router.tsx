import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Root from "./Root";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Chat from "../pages/Chat";
import AuthGuard from "../components/AuthGuard"; 

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Root />}>
        <Route element={<AuthGuard />}>
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Route>
      {/* <Route path="*" element={<NotFound />} /> */}
    </>
  )
);

export default router;