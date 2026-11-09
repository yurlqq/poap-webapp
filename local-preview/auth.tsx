import React from 'react';
export const authClient = {isAuthenticated:()=>true,getAPIToken:async()=> 'local-only',getRole:()=> 'administrator',user:{email:'local@example.test'}};
export const AuthContext = React.createContext(authClient);
