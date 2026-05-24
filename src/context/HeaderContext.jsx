import React, { createContext, useContext, useState } from 'react';

const HeaderContext = createContext({});

export const HeaderProvider = ({ children }) => {
  const [headerConfig, setHeaderConfig] = useState(null);

  return (
    <HeaderContext.Provider value={{ headerConfig, setHeaderConfig }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => useContext(HeaderContext);
