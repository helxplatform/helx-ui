/**
 * Source: https://github.com/RENCI/ncdot-road-safety-client/blob/53c147c434d6d29d9ecbb0d682a3127c08086559/src/hooks/use-local-storage.js
 */

import { useCallback, useEffect, useState } from 'react'

/** `storage` events do not fire on the same tab.
 * this code monkey patches a global, custom `localStorageModified`
 * event. */
// Note: window context preserved across HMR reloading so should not cause buggy race conditions in local development
// when modifying this file hopefully. Maybe still better safe than sorry to hard refresh the page after changing this code.
if (!window.hasOwnProperty("localStorage2")) {
  window.localStorage2 = {
    setItem: window.localStorage.setItem.bind(window.localStorage),
    removeItem: window.localStorage.removeItem.bind(window.localStorage),
    clear: window.localStorage.clear.bind(window.localStorage)
  }  
}
window.localStorage.setItem = function() {
  const cancelled = window.dispatchEvent(new CustomEvent("localStorageModified", {
    // If arguments undefined,
    detail: { type: "set", key: arguments[0], value: arguments[1] },
    bubbles: true,
    cancelable: true
  }))
  !cancelled && window.localStorage2.setItem.apply(this, arguments)
}
window.localStorage.removeItem = function() {
  const cancelled = window.dispatchEvent(new CustomEvent("localStorageModified", {
    detail: { type: "remove", key: arguments[0] },
    bubbles: true,
    cancelable: true
  }))
  !cancelled && window.localStorage2.removeItem.apply(this, arguments)
}
window.localStorage.clear = function() {
  const cancelled = window.dispatchEvent(new CustomEvent("localStorageModified", {
    detail: { type: "clear" },
    bubbles: true,
    cancelable: true
  }))
  !cancelled && window.localStorage2.clear.apply(this, arguments)
}

/**
 * 
 * @param {string} key - Name of the key in localStorage to use.
 * @param {any} initialValue - Default value (if key is not set), may be any JSON-serializable value 
 * @param {boolean} [observeOtherPages=false] - If true, watches for external localStorage changes to the value in other tabs/windows.
 * @returns 
 */
export const useLocalStorage = (key, initialValue, observeOtherPages=true) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      if (item) return JSON.parse(item)
      else {
        window.localStorage2.setItem(key, JSON.stringify(initialValue))
        return initialValue
      }
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
      }
    })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value) => {
    try {
      // Save state
      setStoredValue((existingValue) => {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(existingValue) : value
        // Save to local storage
        // Use the non-monkey patched version to avoid double-calling setState in the effect.
        window.localStorage2.setItem(key, JSON.stringify(valueToStore))
        return valueToStore
      })
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }, [])
  
  useEffect(() => {
    const storageCallback = (e) => {
      const newValue = JSON.parse(localStorage.getItem(key))
      setStoredValue(newValue)
    }
    const modifiedCallback = (e) => {
      const { type } = e.detail
      let newValue
      switch (type) {
        case "set": {
          const { key: keyEvt, value } = e.detail
          if (key !== keyEvt) return
          newValue = JSON.parse(value)
          break
        }
        case "remove": {
          const { key: keyEvt } = e.detail
          if (key !== keyEvt) return
          newValue = null
          break
        }
        case "clear": {
          newValue = null
          break
        }
      }
      // Don't double set state, could lead to weird race conditions with other code working with localStorage.
      setStoredValue(newValue)
    }
    // Storage changed in another tab/window
    if (observeOtherPages) window.addEventListener("storage", storageCallback)
    // Storage changed in this tab
    window.addEventListener("localStorageModified", modifiedCallback)
    return () => {
      window.removeEventListener("storage", storageCallback)
      window.removeEventListener("localStorageModified", modifiedCallback)
    }
  }, [key, observeOtherPages])

  return [storedValue, setValue]
}