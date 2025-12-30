import React from "react";
import Header from "./components/Header";
import UrlsTable from "./components/UrlsTable";
import Footer from "./components/Footer";

const Home = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <UrlsTable />
      <Footer />
    </div>
  );
};

export default Home;
