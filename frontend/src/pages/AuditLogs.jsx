import React, { useEffect, useState } from "react";
import { getAuditLogs } from "../services/api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getAuditLogs().then((res) => setLogs(res.data));
  }, []);

  return (
    <div className="app-bg">
      <div className="page-container">
        <h1 className="page-title">Audit Logs</h1>

        {logs.map((log) => (
          <div key={log.id} className="list-item">
            <p><b>Action:</b> {log.action}</p>
            <p><b>User:</b> {log.user}</p>
            <p><b>Details:</b> {log.details}</p>
            <p><b>Time:</b> {log.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuditLogs;