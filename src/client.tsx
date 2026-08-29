import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout";
import PageViewTracker from "./components/PageViewTracker";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Categories from "./pages/Categories";
import Suburbs from "./pages/Suburbs";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStats from "./pages/admin/Stats";
import "./styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <BrowserRouter>
    <PageViewTracker />
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="categories" element={<Categories />} />
        <Route path="suburbs" element={<Suburbs />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="admin/stats" element={<AdminStats />} />
    </Routes>
    <Analytics />
  </BrowserRouter>,
);
