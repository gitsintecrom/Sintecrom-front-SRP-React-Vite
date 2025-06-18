import React from "react";

const Footer = () => {
  return (
    <footer className="main-footer">
      <strong>Copyright © 2024 {import.meta.env.VITE_APP_NAME}</strong> Todos
      los derechos reservados.
      <div className="float-right d-none d-sm-inline-block">
        <b>Version</b> {import.meta.env.VITE_APP_VERSION}
      </div>
    </footer>
  );
};

export default Footer;
