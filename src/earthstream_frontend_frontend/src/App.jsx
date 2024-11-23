import { useState, useEffect } from 'react';
import { earthstream_frontend_backend } from 'declarations/earthstream_frontend_backend';
import Header from './components/header'
import Home from './pages/home'
import Account from './pages/account'
import Projects from './pages/projects'
import Sensors from './pages/sensors'
import Admin from './pages/admin'
import { isAdmin } from './lib/data'
import { AuthClient } from "@dfinity/auth-client";
import { icpService } from  './services/icp_service';


function App() {
  const [greeting, setGreeting] = useState('');
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [projectsSelected, setProjectsSelected] = useState('all projects');
  const [sensorsSelected, setSensorsSelected] = useState('pre-sale');
  const [signedIn, setSignedIn] = useState(false);
  
  
  const menuSelected = (event, selected) => {
    event.stopPropagation();
    console.log(selected)
    setPage(selected)
  }

  const handleSignIn = async () => {
    try {
      const authClient = await AuthClient.create();
      const success = await new Promise((resolve) => {
        authClient.login({
          identityProvider: "https://identity.ic0.app",
          onSuccess: () => resolve(true),
          onError: () => resolve(false),
        });
      });

      if (success) {
        const identity = authClient.getIdentity();
        // Update the ICP service with the new identity
        icpService.updateIdentity(identity);
        setSignedIn(true);
        let admin = await isAdmin(identity.getPrincipal().toText());
        setUser({identity:identity.getPrincipal().toText(), isAdmin: admin});
        console.log('************************************')
        console.log({identity:identity.getPrincipal().toText(), isAdmin: admin})
        console.log('************************************')
        // Your existing onSignIn logic
        //props.onSignIn(identity);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignOut = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    // Clear the identity in the service
    icpService.updateIdentity(null);
    // Your existing sign out logic
    setSignedIn(false);
    setUser(null);
  };

  // Check if user is already authenticated on component mount
  useEffect(() => {
      async function checkAuth() {
          const authClient = await AuthClient.create();
          const isAuthenticated = await authClient.isAuthenticated();
          
          if (isAuthenticated) {
              const identity = authClient.getIdentity();
              handleSignIn(identity);
          }
      }
      checkAuth();
  }, []);

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
      <Header signedIn={signedIn} user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} onMenuSelect={menuSelected} page={page}/>
      {page === 'home' && <Home />}
      {page === 'account' && <Account signedIn={signedIn} user={user}/>}
      {page === 'projects' && <Projects signedIn={signedIn} user={user} selected={projectsSelected} onSelect={projectsSelect}/>}
      {page === 'sensors' && <Sensors signedIn={signedIn} user={user} selected={sensorsSelected} onSelect={sensorsSelect}/>}
      {page === 'admin' && <Admin signedIn={signedIn} user={user}/>}
    </main>
  );
}

export default App;
