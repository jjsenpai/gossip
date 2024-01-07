import React from "react";
import LogoutButton from "../component/logout-button";

type HomeProps = {
  condition: boolean;
};

export const Home = () => {
  return (
    <div>
      home
      <LogoutButton state={true} />;
    </div>
  );
};
