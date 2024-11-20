import { useState } from 'react';
import { earthstream_frontend_backend } from 'declarations/earthstream_frontend_backend';
import Header from './components/header'
import Home from './pages/home'
import Account from './pages/account'
import Projects from './pages/projects'
import Sensors from './pages/sensors'


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
    setUser({id: 'user1'})
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
    </main>
  );
}

export default App;
