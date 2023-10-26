import React, { createContext, useContext, useState } from 'react'
import axios from 'axios';
import { useEnvironment } from './environment-context';
import { useActivity } from './activity-context';
import { useWorkspacesAPI } from './workspaces-context';

export const InstanceContext = createContext({});

export const InstanceProvider = ({ children }) => {
    const { helxAppstoreUrl } = useEnvironment();
    const { updateActivity } = useActivity();
    const { api } = useWorkspacesAPI();
    const [openedTabs, setTabs] = useState([]);
    const [pollingTimerIDs, setPollingTimerIDs] = useState([])

    const stopPolling = (sid) => {
        // stop polling when instance is deleted
        clearTimeout(pollingTimerIDs[sid])
        setPollingTimerIDs((prev) => {
            delete prev[sid]
            return prev
        })
    }

    // Check the status code of an instance to see if it's ready for use.
    // Do the check every 5 seconds until it returns a OK status.
    // Clear its timeout when the instance is deleted by user.

    const pollingInstance = (app_id, sid, app_url, app_name) => {
        const decoded_url = decodeURIComponent(app_url);
        const executePoll = async () => {
            let isAppReady = false;

            try {
               isAppReady = await api.getAppReady(decoded_url);
            } catch(e) {} // just absorb the exception, the default false is correct here
            if (isAppReady) {
                let newActivity = {
                    'sid': sid,
                    'app_name': app_name,
                    'status': 'success',
                    'timestamp': new Date(),
                    'message': `${app_name} is up and ready for use.`,
                    'url': decoded_url,
                    'app_id': app_id
                }
                updateActivity(newActivity);
            } else {
                let timerID = setTimeout(executePoll, 5000)
                setPollingTimerIDs((prev) => {
                    prev[sid] = timerID
                    return prev
                })
            }
        }
        executePoll();
    }

    const addOrDeleteInstanceTab = (action, app_id, tabIns = undefined) => {
        if (action === "add") {
            setTabs(prev => prev.concat(tabIns));
        }
        // Close its browser tab if an instance is deleted by a use.
        if (action === "close") {
            openedTabs.forEach((item) => {
                if (item.name.split("-")[0] === `${app_id}`) {
                    item.close();
                }
            });
            setTabs(prev => prev.filter(tab => tab.name.split("-")[0] !== `${app_id}`));
        }
    };

    return (
        <InstanceContext.Provider value={{
            addOrDeleteInstanceTab, pollingInstance, stopPolling
        }}>
            {children}
        </InstanceContext.Provider>
    )
}

export const useInstance = () => useContext(InstanceContext);