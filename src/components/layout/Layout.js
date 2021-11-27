const React = require('react');
const Header = require('./Header');
const Footer = require('./Footer');

const Layout = ({ childComponent }) => (
  <>
    <Header/>
    {childComponent}
    <Footer/>
  </>
);

module.exports = Layout;
