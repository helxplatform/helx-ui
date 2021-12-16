import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { useEnvironment } from './environment-context';
import { useActivity } from './activity-context';
import { resolveOnChange } from 'antd/lib/input/Input';

export const InstanceContext = createContext({});

export const InstanceProvider = ({ children }) => {
    const { helxAppstoreUrl } = useEnvironment();
    const { addActivity, updateActivity } = useActivity();
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

    const pollingInstance = (app_id, sid, app_url, app_name) => {
        let ready = false;
        const decoded_url = decodeURIComponent(app_url);
        const executePoll = async () => {
            const result = await axios.get(decoded_url)
                .then(response => {
                    if (response.status == 200) {
                        ready = true;
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
                    }
                })
                .catch((e) => {
                    let timerID = setTimeout(executePoll, 5000)
                    setPollingTimerIDs((prev) => {
                        prev[sid] = timerID
                        return prev
                    })
                    console.log(e);
                });
        }
        executePoll();
    }

    const addOrDeleteInstanceTab = (action, app_id, tabIns = undefined) => {
        if (action === "add") {
            setTabs(prev => prev.concat(tabIns));
        }
        if (action === "close") {
            openedTabs.map((item) => {
                if (item.name.split("-")[0] === `${app_id}`) {
                    item.close();
                };
            });
            setTabs(prev => prev.filter(tab => tab.name.split("-")[0] != `${app_id}`));
        };
    };

    const loadInstances = () => {
        return axios.get(`${helxAppstoreUrl}/api/v1/instances`)
    }

    const stopInstance = (app_id) => {
        return axios.delete(`${helxAppstoreUrl}/api/v1/instances/${app_id}`);
    }

    const updateInstance = (app_id, workspace, cpu, gpu, memory) => {
        const data = {}
        data["cpu"] = `${cpu}`;
        data["gpu"] = `${gpu}`;
        if (memory.length > 0) {
            data["memory"] = `${memory}`;
        }
        if (workspace.length > 0) {
            data["labels"] = { "app-name": `${workspace}` };
        }
        return axios.patch(`${helxAppstoreUrl}/api/v1/instances/${app_id}/`, data)
    }

    return (
        <InstanceContext.Provider value={{
            loadInstances, stopInstance, updateInstance, addOrDeleteInstanceTab, pollingInstance, stopPolling
        }}>
            {children}
        </InstanceContext.Provider>
    )
}

export const useInstance = () => useContext(InstanceContext);