const React = require('react');
const Layout = require('./components/layout/Layout');
const WaveForm = require('./components/WaveForm');

const App = () => (
  <>
    <Layout childComponent={<WaveForm />} />
  </>
);

module.exports = App;