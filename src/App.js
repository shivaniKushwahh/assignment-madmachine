import React, { useState, useEffect, useCallback, useRef } from "react";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const corsProxy = "https://api.allorigins.win/get?url=";
  const url = `${corsProxy}https://webhook.site/6553b826-b49b-47ae-9b6a-c924a0c506af`;
  const syncInProgress = useRef(false);  // To track if sync is in progress

  const handleClick = async () => {
    const data = { timestamp: new Date().toISOString() };

    if (isOnline) {
      try {
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        console.log("Request sent!");
      } catch (error) {
        console.error("Error sending request:", error);
      }
    } else {
      saveRequestOffline(data);
      console.log("Saved request offline.");
    }
  };

  const saveRequestOffline = async (data) => {
    const db = await openDatabase();
    const tx = db.transaction("requests", "readwrite");
    const store = tx.objectStore("requests");
    store.add({ id: Date.now(), data });
    await tx.done;
  };

  const openDatabase = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("offlineRequests", 1);
      request.onerror = (event) => reject("Error opening database");
      request.onsuccess = (event) => resolve(event.target.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("requests", { keyPath: "id" });
      };
    });
  };

  const syncRequests = useCallback(async () => {
    if (syncInProgress.current) {
      return; // Prevent re-entry if sync is already in progress
    }
    syncInProgress.current = true; // Set sync in progress flag

    try {
      const db = await openDatabase();
      const tx = db.transaction("requests", "readwrite");
      const store = tx.objectStore("requests");

      const allRecords = await new Promise((resolve, reject) => {
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      });

      if (Array.isArray(allRecords) && allRecords.length > 0) {
        for (const record of allRecords) {
          try {
            await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(record.data),
            });
            store.delete(record.id);
            console.log("Synced offline request!");
          } catch (error) {
            console.error("Error syncing request:", error);
            break; // If a sync fails, stop processing further until the next attempt
          }
        }
      } else {
        console.log("No offline requests to sync.");
      }

      await tx.done;
    } catch (error) {
      console.error("Failed to sync requests:", error);
    } finally {
      syncInProgress.current = false; // Reset the sync in progress flag
    }
  }, [url]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncRequests();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncRequests]);

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={handleClick}>Hit Me</button>
        <p>{isOnline ? "You are online" : "You are offline"}</p>
      </header>
    </div>
  );
}

export default App;
