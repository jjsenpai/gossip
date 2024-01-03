import { Component } from "solid-js";
import { Router, Route } from "@solidjs/router";
import { Home } from "./pages/home";

const App: Component = () => {
  return (
    <>
      {/* <Route path="/users" component={Users} /> */}
      <Route path="/" component={Home} />
    </>
  );
};

export default App;
