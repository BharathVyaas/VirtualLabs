import React from "react";
import EventScheduler from "./EventScheduler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import NotFound from "./404NotFound";
import ServerMaintenancePage from "./ServerMaintenancePage";

function App() {
  const client = new QueryClient();
  const router = createBrowserRouter([
    {
      path: "/Vlabslots",
      element: (
        <QueryClientProvider client={client}>
          <EventScheduler />
        </QueryClientProvider>
      ),
    },
    {
      path: "*",
      element: (
        <QueryClientProvider disableErrorBoundary={true} client={client}>
          <EventScheduler />
        </QueryClientProvider>
      ),
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
