import React, { createContext, useContext } from 'react'
import axios from 'axios';
import { useEnvironment } from './environment-context';

export const InstanceContext = createContext({});

export const InstanceProvider = ({ children }) => {
    const { helxAppstoreUrl } = useEnvironment();

    const loadInstances = () => {
        return axios.get(`${helxAppstoreUrl}/api/v1/instances`)
    }

    const stopInstance = (app_id) => {
        return axios.delete(`${helxAppstoreUrl}/api/v1/instances/${app_id}`);
    }

    return (
        <InstanceContext.Provider value={{
            loadInstances, stopInstance
        }}>
            {children}
        </InstanceContext.Provider>
    )
}

export const useInstance = () => useContext(InstanceContext);