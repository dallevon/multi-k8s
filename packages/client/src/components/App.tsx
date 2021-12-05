import { BrowserRouter as Router, Link, Route } from 'react-router-dom';

import OtherPage from './OtherPage';
import Fib from './Fib';
import logo from './assets/logo.svg';
import styles from './App.module.scss';

const App: React.FC = () => (
  <Router>
    <header className={styles.appHeader}>
      <img src={logo} className={styles.appLogo} alt="logo" />
      <h1 className={styles.header}>Fibonacci Calculator</h1>
      <nav className={styles.nav}>
        <Link to="/">Home</Link>
        <Link to="/otherpage">Other Page</Link>
      </nav>
    </header>
    <main className={styles.main}>
      <Route exact path="/" component={Fib} />
      <Route path="/otherpage" component={OtherPage} />
    </main>
  </Router>
);

export default App;
