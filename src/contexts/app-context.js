import React, { useState, createContext, useContext } from 'react'
import axios from 'axios';
import { useEnvironment } from './environment-context';

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {
    const { helxAppstoreUrl } = useEnvironment();
    const [lastLaunchedTime, setLastLaunchTime] = useState();

    const launchApp = (app_id, cpu, gpu, memory) => {
        const params = {
            app_id: app_id,
            cpus: cpu,
            memory: memory,
            gpus: gpu
        };
        setLastLaunchTime(new Date())
        return axios.post(`${helxAppstoreUrl}/api/v1/instances/`, params);
    }

    const loadApps = () => {
        return axios.get(`${helxAppstoreUrl}/api/v1/apps`)
    }


    return (
        <AppContext.Provider value={{
            launchApp, loadApps, lastLaunchedTime
        }}>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => useContext(AppContext);