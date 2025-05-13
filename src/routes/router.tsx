import {
  createBrowserRouter,
} from "react-router-dom";
import type {
  RouteObject
} from "react-router-dom";
import Root from "./Root";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Root />,
  },
];

const router = createBrowserRouter(routes);

export default router;