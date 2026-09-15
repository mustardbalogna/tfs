import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout";
import PageViewTracker from "./components/PageViewTracker";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/Login";
import AdminOverview from "./pages/admin/Overview";
import AdminMessages from "./pages/admin/Messages";
import AdminStats from "./pages/admin/Stats";
import AdminCategories from "./pages/admin/Categories";
import AdminCategoryForm from "./pages/admin/CategoryForm";
import AdminEditor from "./pages/admin/Editor";
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
        <Route path="contact" element={<Contact />} />
      </Route>
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<AdminOverview />} />
      <Route path="admin/messages" element={<AdminMessages />} />
      <Route path="admin/editor" element={<AdminEditor />} />
      <Route path="admin/content" element={<Navigate to="/admin/editor" replace />} />
      <Route path="admin/stats" element={<AdminStats />} />
      <Route path="admin/categories" element={<AdminCategories />} />
      <Route path="admin/categories/new" element={<AdminCategoryForm />} />
      <Route path="admin/categories/:id/edit" element={<AdminCategoryForm />} />
    </Routes>
    <Analytics />
  </BrowserRouter>,
);
