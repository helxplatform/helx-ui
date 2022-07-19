import React, { createContext, useContext } from 'react'
import axios from 'axios';
import { useEnvironment } from './environment-context';

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {
    const { helxAppstoreUrl } = useEnvironment();
    
    const launchApp = (app_id, cpu, gpu, memory) => {
        const params = {
            app_id: app_id,
            cpus: cpu,
            memory: memory,
            gpus: gpu
        };
        return axios.post(`${helxAppstoreUrl}/api/v1/instances/`, params);
    }

    // load all available apps
    const loadApps = () => {
        return axios.get(`${helxAppstoreUrl}/api/v1/apps`)
    }


    return (
        <AppContext.Provider value={{
            launchApp, loadApps
        }}>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => useContext(AppContext);