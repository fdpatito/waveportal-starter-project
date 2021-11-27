const React = require('react');

const Header = ({ childComponent }) => (
  <>
    <div className="page-header">
      <img className="logo" alt="rainbow" src={require('../../assets/images/rain3.png')} />
      <h1 className="header-title">Dwitter</h1> 
    </div>
  </>
);

module.exports = Header;
