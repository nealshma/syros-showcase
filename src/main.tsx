import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import Layout from "./routes/__root";
import Home from "./routes/index";
import Creative1 from "./routes/experience-creative1";
import Creative2 from "./routes/experience-creative2";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/experience-creative1" element={<Creative1 />} />
          <Route path="/experience-creative2" element={<Creative2 />} />
          <Route path="*" element={<Layout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
