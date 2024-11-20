import { useState } from 'react';
import { earthstream_frontend_backend } from 'declarations/earthstream_frontend_backend';
import Header from './components/header'
import Home from './pages/home'
import Account from './pages/account'
import Projects from './pages/projects'
import Sensors from './pages/sensors'
import Admin from './pages/admin'
import { isAdmin } from './lib/data'


function App() {
  const [greeting, setGreeting] = useState('');
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [projectsSelected, setProjectsSelected] = useState('all projects');
  const [sensorsSelected, setSensorsSelected] = useState('pre-sale');

  const signedIn = () => (user!==null);

  const menuSelected = (event, selected) => {
    event.stopPropagation();
    console.log(selected)
    setPage(selected)
  }

  function signIn() {
    //TODO - internet identity sign in
    //check is admin
    
    console.log('getting admin status')
    isAdmin('user1').then((admin) => {
      setUser({id: 'user1', isAdmin: admin})
    })
    
    setUser({id: 'user1', isAdmin: false})
  }

  function signOut() {
    setUser(null)
  }

  function projectsSelect(selected) {
    console.log(selected)
    setProjectsSelected(selected)
  }

  function sensorsSelect(selected) {
    console.log(selected)
    setSensorsSelected(selected)
  }

  function handleSubmit(event) {
    event.preventDefault();
    const name = event.target.elements.name.value;
    earthstream_frontend_backend.greet(name).then((greeting) => {
      setGreeting(greeting);
    });
    return false;
  }

  return (
    <main>
      <Header signedIn={signedIn()} user={user} onSignIn={signIn} onSignOut={signOut} onMenuSelect={menuSelected} page={page}/>
      {page === 'home' && <Home />}
      {page === 'account' && <Account signedIn={signedIn()} user={user}/>}
      {page === 'projects' && <Projects signedIn={signedIn()} user={user} selected={projectsSelected} onSelect={projectsSelect}/>}
      {page === 'sensors' && <Sensors signedIn={signedIn()} user={user} selected={sensorsSelected} onSelect={sensorsSelect}/>}
      {page === 'admin' && <Admin signedIn={signedIn()} user={user}/>}
    </main>
  );
}

export default App;
