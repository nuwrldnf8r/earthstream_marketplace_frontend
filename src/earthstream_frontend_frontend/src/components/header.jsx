import React, { useState, useCallback } from 'react';
import { ButtonBlack } from './button';
import MenuItem from './menuitem';
import Spacer from './spacer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthClient } from "@dfinity/auth-client";

const fontFamily = '"Lato", sans-serif';

function Header(props) {
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleSignIn = useCallback(async () => {
        try {
            setIsAuthenticating(true);
            
            const authClient = await AuthClient.create();
            
            // Start the login process and wait for it to complete
            const success = await new Promise((resolve) => {
                authClient.login({
                    identityProvider: "https://identity.ic0.app",
                    onSuccess: () => resolve(true),
                    onError: () => resolve(false),
                });
            });

            if (success) {
                const identity = authClient.getIdentity();
                // Call the parent's onSignIn with the identity
                props.onSignIn(identity);
            }
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setIsAuthenticating(false);
        }
    }, [props.onSignIn]);

    const handleSignOut = useCallback(async () => {
        try {
            const authClient = await AuthClient.create();
            await authClient.logout();
            props.onSignOut();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [props.onSignOut]);

    let isSelected = (page) => props.page === page;

    return (
        <div style={{
            display: 'flex', 
            width: '100%', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            margin: 0, 
            padding: 8, 
            backgroundColor: '#ffffff'
        }}>
            <div style={{ flex: '0 1 auto' }}>
                <img src="/images/logo.webp" alt="earthstream logo" width="180"/>   
            </div>
           
            <div style={{
                display: 'flex',
                flex: '0 1 auto',
                justifyContent: 'flex-end',
                fontFamily,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#1B1B1B',
                paddingRight: 20,
                alignItems: 'center'
            }}>
                <MenuItem 
                    selected={isSelected('sensors')} 
                    onClick={(e) => props.onMenuSelect(e, 'sensors')}
                >
                    SENSORS
                </MenuItem>
                <MenuItem 
                    selected={isSelected('projects')} 
                    onClick={(e) => props.onMenuSelect(e, 'projects')}
                >
                    PROJECTS
                </MenuItem>
                {props.user && props.user.isAdmin && (
                    <MenuItem 
                        selected={isSelected('admin')} 
                        onClick={(e) => props.onMenuSelect(e, 'admin')}
                    >
                        ADMIN
                    </MenuItem>
                )}
                <Spacer width={50} />
                {props.signedIn && (
                    <>
                        <div 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginRight: 20, 
                                fontSize: 20, 
                                cursor: 'pointer'
                            }} 
                            onClick={e => props.onMenuSelect(e, 'account')}
                        >
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <ButtonBlack onClick={handleSignOut}>
                                SIGN OUT
                            </ButtonBlack>
                        </div>
                    </>
                )}
                {!props.signedIn && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ButtonBlack 
                            onClick={handleSignIn} 
                            disabled={isAuthenticating}
                        >
                            {isAuthenticating ? 'SIGNING IN...' : 'SIGN IN'}
                        </ButtonBlack>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;