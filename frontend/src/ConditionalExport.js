import { AuthContext } from './AuthProvider';
import React, { useContext } from 'react';
import GraphsbyAdmin from './GraphsByAdmin';
import GraphsByHoe from './GraphsByHOE';

import { jwtDecode } from 'jwt-decode';
import GraphsbyManager from './GraphsByManager';

const ConditionalExport = () => {
  const { token } = useContext(AuthContext);
  const decoded = jwtDecode(token);
  
  if (decoded.role === 'admin') {
    return <GraphsbyAdmin />;
  } else if (decoded.role === 'hoe') {
    return <GraphsByHoe />;
  } else if (decoded.role === 'manager') {
    return <GraphsbyManager />;
  } else {
    return null; // Or a fallback component
  }
};

export default ConditionalExport;
